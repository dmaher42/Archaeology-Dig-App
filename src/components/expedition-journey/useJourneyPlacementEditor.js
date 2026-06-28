import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  JOURNEY_PROP_EDITOR_STORAGE_KEY,
  JOURNEY_PROP_EDITOR_SECTIONS_KEY,
} from './journeyConstants';
import { worldToScreenX } from './journeyLayout.js';
import { getSectionForX } from './journeyUtils.js';
import {
  clamp,
  createJourneyForegroundDetailsPalette,
  createJourneyGroundDetailsPalette,
  createJourneyPlatformFromPaletteItem,
  createJourneyPlatformPalette,
  createJourneyPropFromPaletteItem,
  createJourneyPropPalette,
  createJourneyShardPropsPalette,
  createJourneyTrapFromPaletteItem,
  createJourneyTrapPalette,
  createJourneyPlacementChangeSummary,
  createJourneyPlacementAiInstructions,
  createJourneyPropPlacementExport,
  serializeJourneyPropEditorState,
  restoreJourneyPropEditorState,
  JOURNEY_PROP_SCENE_BLEND_RECIPE,
  DEFAULT_JOURNEY_PROP_EDITOR_GRID_SIZE,
  duplicateJourneyPropForEditor,
  getJourneyTrapTriggerRect,
  getJourneyPropRoomId,
  snapJourneyPropCoordinate,
  JOURNEY_TRAP_TYPES,
  normalizeJourneyTrap,
} from './journeyUtils.js';
import {
  ENVIRONMENT_ASSET_PACK_IDS,
  getEnvironmentAssetPackConfig,
  getEnvironmentAssetKeyForStoryProp,
} from './journeyRenderAssets.js';
import lostSitePropRegistry from './lostSitePropRegistry.json';

/* eslint-disable react-hooks/exhaustive-deps -- every dependency the rule flags in this file
   is a stable ref or a module-level helper passed in from the component; none change across
   renders, so omitting them from dependency arrays is correct and preserves the original
   pre-extraction behaviour. */

// DEV-only prop-placement EDITOR core. Extracted wholesale from ExpeditionJourney as a
// pure mechanical move: every callback here is editor tooling (drag-to-place props,
// transform/colour edits, undo/redo, per-room export, the Scene Outliner snapshot). The
// shared placement state (propPlacementEditorRef) and all gameplay resolvers stay in the
// component and are passed in via deps so the live render/update path is untouched.
export function useJourneyPlacementEditor({
  // --- shared refs / state owned by the component ---
  propPlacementEditorRef,
  stateRef,
  canvasRef,
  scorpionNestRef,
  environmentAssetsRef,
  atmosphereEnvironmentAssetsRef,
  foregroundDepthEnvironmentAssetsRef,
  premiumGroundContactAssetsRef,
  setCollapsedPanelSections,
  targetCivilisation,
  // --- module-private scene/prop helpers defined in ExpeditionJourney ---
  GATE,
  STORY_PROPS,
  STORY_PROP_DEPTH_ORDER,
  GENERATED_STORY_PROP_PREVIEW_SOURCES,
  getJourneySceneId,
  isInteriorChamberScene,
  isEntityActiveInScene,
  isPlatformAvailable,
  isHazardAvailable,
  isJourneyFloorPlatform,
  isJourneyBlockerPlatform,
  isGeneratedStoryStructureProp,
  pruneObsoleteLostBridgeRavineFloorEditorProps,
  pruneRetiredDesertEntryBackgroundEditorProps,
  getStoryPropDepth,
  getStoryPropEditorSize,
  getStoryPropEditorBounds,
  getStoryPropExplicitGroundY,
  getHazardBurialAmount,
  getJourneyMiniBosses,
  // --- gameplay resolvers (stay in component) ---
  getRenderableStoryProps,
  getRenderablePlatforms,
  getRenderableHazards,
  getRenderableRouteGates,
  getRenderableRouteGateDoorways,
  getRenderableCheckpoints,
  getRenderableScarabLairs,
  getRenderableScorpionNests,
  getEditedStoryProp,
  getEditedPlatform,
  getEditedHazard,
  getEditedRouteGate,
  getEditedRouteGateDoorway,
  getEditedCheckpoint,
  getEditedMiniBoss,
  getEditedNestParams,
  getAllPropEditorStoryProps,
  getAllPropEditorPlatforms,
  getAllPropEditorHazards,
  getPropEditorBasePropById,
  getPlatformEditorBasePlatformById,
  getHazardEditorBaseHazardById,
  getRouteGateEditorBaseGateById,
  getRouteGateEditorBaseDoorwayById,
  getCheckpointEditorBaseCheckpointById,
  getMiniBossEditorBaseBossById,
  getActivePropEditorRoomId,
  getPlatformEditorRoomId,
  getHazardEditorRoomId,
  getScarabQueenLairPlacement,
}) {
  const propEditorPalette = useMemo(() => createJourneyPropPalette(STORY_PROPS, lostSitePropRegistry), [STORY_PROPS]);
  const groundDetailsEditorPalette = useMemo(() => createJourneyGroundDetailsPalette(), []);
  const foregroundDetailsEditorPalette = useMemo(() => createJourneyForegroundDetailsPalette(), []);
  const shardPropsEditorPalette = useMemo(() => createJourneyShardPropsPalette(), []);
  const trapEditorPalette = useMemo(() => createJourneyTrapPalette(), []);
  const platformEditorPalette = useMemo(() => createJourneyPlatformPalette(), []);
  const propEditorPersistTimeoutRef = useRef(null);
  const editorUndoStackRef = useRef([]);
  const editorRedoStackRef = useRef([]);
  const editorHistoryBaselineRef = useRef(null);
  const editorHistoryTimeoutRef = useRef(null);
  const [propEditorUi, setPropEditorUi] = useState({
    enabled: false,
    selectedProp: null,
    selectedPlatform: null,
    selectedHazard: null,
    selectedArch: null,
    selectedCheckpoint: null,
    selectedLair: null,
    selectedNest: null,
    gridSnap: false,
    gridSize: DEFAULT_JOURNEY_PROP_EDITOR_GRID_SIZE,
    paletteOpen: false,
    selectedPaletteKey: null,
    selectedPaletteCategory: 'prop',
    stampMode: false,
    showTrapTriggers: true,
    showHoverLabels: true,
    previewMode: false,
    panelCollapsed: false,
    floorPickMode: false,
    palette: [],
    selectedLockKey: null,
    selectedLocked: false,
    lockedCount: 0,
    unsavedChangeSummary: createJourneyPlacementChangeSummary(),
    exportText: '',
    aiInstructions: '',
    exportVisible: false,
    savedAt: null,
  });

  const toggleEditorPanelSection = useCallback((key) => {
    setCollapsedPanelSections((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        window.localStorage.setItem(JOURNEY_PROP_EDITOR_SECTIONS_KEY, JSON.stringify(next));
      } catch {
        /* ignore persistence errors */
      }
      return next;
    });
  }, []);

  const getPropEditorSelectedProp = useCallback((current = stateRef.current) => {
    const editor = propPlacementEditorRef.current;
    if (!editor.selectedPropId) return null;
    const baseProp = getPropEditorBasePropById(editor.selectedPropId);
    const prop = getEditedStoryProp(baseProp);
    if (!prop || !isEntityActiveInScene(prop, current)) return null;
    return prop;
  }, [getEditedStoryProp, getPropEditorBasePropById]);

  const getPropEditorSelectedPlatform = useCallback((current = stateRef.current) => {
    const editor = propPlacementEditorRef.current;
    if (!editor.selectedPlatformId) return null;
    const basePlatform = getPlatformEditorBasePlatformById(editor.selectedPlatformId);
    const platform = getEditedPlatform(basePlatform);
    if (!platform || !isPlatformAvailable(platform, current)) return null;
    return platform;
  }, [getEditedPlatform, getPlatformEditorBasePlatformById]);

  const getPropEditorSelectedHazard = useCallback((current = stateRef.current) => {
    const editor = propPlacementEditorRef.current;
    if (!editor.selectedHazardId) return null;
    const baseHazard = getHazardEditorBaseHazardById(editor.selectedHazardId);
    const hazard = getEditedHazard(baseHazard);
    if (!hazard || !isHazardAvailable(hazard, current)) return null;
    return hazard;
  }, [getEditedHazard, getHazardEditorBaseHazardById]);

  const getPropEditorSelectedArch = useCallback(() => {
    const editor = propPlacementEditorRef.current;
    if (!editor.selectedArchId) return null;
    const [kind, id] = editor.selectedArchId.split(':');
    if (kind === 'doorway') {
      const doorway = getEditedRouteGateDoorway(getRouteGateEditorBaseDoorwayById(id));
      return doorway ? { ...doorway, editorKind: 'doorway', editorId: editor.selectedArchId } : null;
    }
    const gate = getEditedRouteGate(getRouteGateEditorBaseGateById(id));
    return gate ? { ...gate, editorKind: 'gate', editorId: editor.selectedArchId } : null;
  }, [getEditedRouteGate, getEditedRouteGateDoorway, getRouteGateEditorBaseDoorwayById, getRouteGateEditorBaseGateById]);

  const getPropEditorSelectedCheckpoint = useCallback(() => {
    const editor = propPlacementEditorRef.current;
    if (!editor.selectedCheckpointId) return null;
    return getEditedCheckpoint(getCheckpointEditorBaseCheckpointById(editor.selectedCheckpointId));
  }, [getCheckpointEditorBaseCheckpointById, getEditedCheckpoint]);

  const getPropEditorSelectedLair = useCallback(() => {
    const editor = propPlacementEditorRef.current;
    if (!editor.selectedLairId) return null;
    return getEditedMiniBoss(getMiniBossEditorBaseBossById(editor.selectedLairId));
  }, [getEditedMiniBoss, getMiniBossEditorBaseBossById]);

  const getSelectedEditorLockKey = useCallback(() => {
    const editor = propPlacementEditorRef.current;
    if (editor.selectedPropId) return `prop:${editor.selectedPropId}`;
    if (editor.selectedPlatformId) return `platform:${editor.selectedPlatformId}`;
    if (editor.selectedHazardId) return `hazard:${editor.selectedHazardId}`;
    if (editor.selectedArchId) return `arch:${editor.selectedArchId}`;
    if (editor.selectedCheckpointId) return `checkpoint:${editor.selectedCheckpointId}`;
    if (editor.selectedLairId) return `lair:${editor.selectedLairId}`;
    return null;
  }, []);

  const isEditorLockKeyLocked = useCallback((lockKey) => (
    Boolean(lockKey && propPlacementEditorRef.current.lockedItems.has(lockKey))
  ), []);

  const isEditorEntityLocked = useCallback((kind, id) => (
    Boolean(kind && id && propPlacementEditorRef.current.lockedItems.has(`${kind}:${id}`))
  ), []);

  const applyDefaultEditorLocks = useCallback((current = stateRef.current) => {
    const editor = propPlacementEditorRef.current;
    if (editor.defaultLocksApplied) return;
    getRenderableStoryProps(current).forEach((prop) => {
      if (prop?.id) editor.lockedItems.add(`prop:${prop.id}`);
    });
    getRenderablePlatforms(current).forEach((platform) => {
      const id = platform?.id || platform?.label;
      if (id) editor.lockedItems.add(`platform:${id}`);
    });
    if (!current.arrivalThresholdActive) getRenderableHazards(current).forEach((hazard) => {
      if (hazard?.id) editor.lockedItems.add(`hazard:${hazard.id}`);
    });
    getRenderableRouteGateDoorways().forEach((doorway) => {
      if (doorway?.id) editor.lockedItems.add(`arch:doorway:${doorway.id}`);
    });
    getRenderableRouteGates().forEach((gate) => {
      if (gate?.id) editor.lockedItems.add(`arch:gate:${gate.id}`);
    });
    getRenderableCheckpoints().forEach((checkpoint) => {
      if (checkpoint?.id) editor.lockedItems.add(`checkpoint:${checkpoint.id}`);
    });
    getRenderableScarabLairs().forEach((lair) => {
      if (lair?.id) editor.lockedItems.add(`lair:${lair.id}`);
    });
    editor.defaultLocksApplied = true;
  }, [getRenderableCheckpoints, getRenderableHazards, getRenderablePlatforms, getRenderableRouteGateDoorways, getRenderableRouteGates, getRenderableScarabLairs, getRenderableStoryProps]);

  const getLairEditorBounds = useCallback((boss, cameraX) => {
    const placement = getScarabQueenLairPlacement(boss);
    return {
      x: worldToScreenX(placement.x, cameraX) - placement.width / 2,
      y: placement.top,
      width: placement.width,
      height: placement.height,
    };
  }, [getScarabQueenLairPlacement]);

  const findEditableScarabLairAt = useCallback((screenX, screenY) => {
    const cameraX = Number.isFinite(stateRef.current.cameraX) ? stateRef.current.cameraX : 0;
    return getRenderableScarabLairs()
      .map((boss, index) => ({ boss, index, bounds: getLairEditorBounds(boss, cameraX) }))
      .filter(({ bounds }) => (
        screenX >= bounds.x
        && screenX <= bounds.x + bounds.width
        && screenY >= bounds.y
        && screenY <= bounds.y + bounds.height
      ))
      .sort((a, b) => a.index - b.index)
      .at(-1)?.boss || null;
  }, [getLairEditorBounds, getRenderableScarabLairs]);

  const getScorpionNestArtAspect = useCallback(() => {
    const image = scorpionNestRef.current.image;
    if (!image) return 1.5;
    const w = image.naturalWidth || image.width || 3;
    const h = image.naturalHeight || image.height || 2;
    return h > 0 ? w / h : 1.5;
  }, []);

  const getNestEditorBounds = useCallback((enemy, cameraX) => {
    const params = getEditedNestParams(enemy);
    const drawWidth = enemy.width * params.widthScale;
    const drawHeight = drawWidth / getScorpionNestArtAspect();
    const baseY = params.y + enemy.height + params.yOffset;
    const centerScreenX = worldToScreenX(params.x, cameraX) + enemy.width / 2;
    return {
      x: centerScreenX - drawWidth / 2,
      y: baseY - drawHeight,
      width: drawWidth,
      height: drawHeight,
    };
  }, [getEditedNestParams, getScorpionNestArtAspect]);

  const findEditableNestAt = useCallback((screenX, screenY) => {
    const cameraX = Number.isFinite(stateRef.current.cameraX) ? stateRef.current.cameraX : 0;
    return getRenderableScorpionNests()
      .map((enemy, index) => ({ enemy, index, bounds: getNestEditorBounds(enemy, cameraX) }))
      .filter(({ bounds }) => (
        screenX >= bounds.x
        && screenX <= bounds.x + bounds.width
        && screenY >= bounds.y
        && screenY <= bounds.y + bounds.height
      ))
      .sort((a, b) => a.index - b.index)
      .at(-1)?.enemy || null;
  }, [getNestEditorBounds, getRenderableScorpionNests]);

  const getPropEditorSelectedNest = useCallback(() => {
    const id = propPlacementEditorRef.current.selectedNestId;
    if (!id) return null;
    return getRenderableScorpionNests().find(enemy => enemy.id === id) || null;
  }, [getRenderableScorpionNests]);

  const getArchEditorBounds = useCallback((arch, cameraX) => {
    const worldX = arch.editorKind === 'doorway'
      ? Number.isFinite(arch.anchorX) ? arch.anchorX : arch.blockX
      : arch.x;
    const width = Math.max(Number(arch.width) || 48, 48);
    const height = Math.max(Number(arch.height) || 96, 48);
    return {
      x: worldToScreenX(worldX, cameraX) - width / 2,
      y: Number.isFinite(arch.y) ? arch.y : GATE.y,
      width,
      height,
    };
  }, []);

  const getCheckpointEditorBounds = useCallback((checkpoint, cameraX) => ({
    x: worldToScreenX(checkpoint.x, cameraX) - 24,
    y: checkpoint.y - 64,
    width: 48,
    height: 72,
  }), []);

  const findEditableArchAt = useCallback((screenX, screenY) => {
    const cameraX = Number.isFinite(stateRef.current.cameraX) ? stateRef.current.cameraX : 0;
    const doorwayTargets = getRenderableRouteGateDoorways().map(doorway => ({
      ...doorway,
      editorKind: 'doorway',
      editorId: `doorway:${doorway.id}`,
    }));
    const gateTargets = getRenderableRouteGates().map(gate => ({
      ...gate,
      editorKind: 'gate',
      editorId: `gate:${gate.id}`,
    }));
    return [...doorwayTargets, ...gateTargets]
      .map((arch, index) => ({ arch, index, bounds: getArchEditorBounds(arch, cameraX) }))
      .filter(({ bounds }) => (
        screenX >= bounds.x
        && screenX <= bounds.x + bounds.width
        && screenY >= bounds.y
        && screenY <= bounds.y + bounds.height
      ))
      .sort((a, b) => {
        const areaDelta = (b.bounds.width * b.bounds.height) - (a.bounds.width * a.bounds.height);
        if (areaDelta !== 0) return areaDelta;
        return a.index - b.index;
      })
      .at(-1)?.arch || null;
  }, [getArchEditorBounds, getRenderableRouteGateDoorways, getRenderableRouteGates]);

  const findEditableCheckpointAt = useCallback((screenX, screenY) => {
    const cameraX = Number.isFinite(stateRef.current.cameraX) ? stateRef.current.cameraX : 0;
    return getRenderableCheckpoints()
      .map((checkpoint, index) => ({ checkpoint, index, bounds: getCheckpointEditorBounds(checkpoint, cameraX) }))
      .filter(({ bounds }) => (
        screenX >= bounds.x
        && screenX <= bounds.x + bounds.width
        && screenY >= bounds.y
        && screenY <= bounds.y + bounds.height
      ))
      .sort((a, b) => a.index - b.index)
      .at(-1)?.checkpoint || null;
  }, [getCheckpointEditorBounds, getRenderableCheckpoints]);

  const getHazardEditorBounds = useCallback((hazard, cameraX) => {
    const editorWidth = Math.max(hazard.width, 38);
    const editorHeight = Math.max(hazard.height, 34);
    return {
      x: worldToScreenX(hazard.x, cameraX) - Math.max(0, (editorWidth - hazard.width) / 2),
      y: hazard.y - Math.max(0, (editorHeight - hazard.height) / 2),
      width: editorWidth,
      height: editorHeight,
    };
  }, []);

  const findEditableHazardAt = useCallback((screenX, screenY) => {
    const current = stateRef.current;
    const cameraX = Number.isFinite(current.cameraX) ? current.cameraX : 0;
    return getRenderableHazards(current)
      .filter(hazard => hazard.editorVisible !== false)
      .map((hazard, index) => ({
        hazard,
        index,
        bounds: getHazardEditorBounds(hazard, cameraX),
      }))
      .filter(({ bounds }) => (
        screenX >= bounds.x
        && screenX <= bounds.x + bounds.width
        && screenY >= bounds.y
        && screenY <= bounds.y + bounds.height
      ))
      .sort((a, b) => {
        const areaDelta = (b.bounds.width * b.bounds.height) - (a.bounds.width * a.bounds.height);
        if (areaDelta !== 0) return areaDelta;
        return a.index - b.index;
      })
      .at(-1)?.hazard || null;
  }, [getHazardEditorBounds, getRenderableHazards]);

  const getPlatformEditorBounds = useCallback((platform, cameraX, current) => {
    const isFloor = isJourneyFloorPlatform(platform);
    const isBlocker = isJourneyBlockerPlatform(platform);
    const editorHeight = isFloor ? Math.max(platform.height + 58, 96) : Math.max(platform.height, isBlocker ? 36 : 30);
    const verticalOffset = !isInteriorChamberScene(current) ? current.secretVerticalCameraOffset || 0 : 0;
    const y = platform.y + verticalOffset;
    return {
      x: worldToScreenX(platform.x, cameraX),
      y: isFloor ? y - 46 : isBlocker ? y : y - Math.max(0, (editorHeight - platform.height) / 2),
      width: platform.width,
      height: editorHeight,
    };
  }, []);

  const findEditablePlatformAt = useCallback((screenX, screenY, options = {}) => {
    const current = stateRef.current;
    const cameraX = Number.isFinite(current.cameraX) ? current.cameraX : 0;
    const { floorOnly = false, includeFloors = true } = options;
    return getRenderablePlatforms(current)
      .filter((platform) => {
        const isFloor = isJourneyFloorPlatform(platform);
        if (floorOnly) return isFloor;
        return includeFloors || !isFloor;
      })
      .map((platform, index) => ({
        platform,
        index,
        bounds: getPlatformEditorBounds(platform, cameraX, current),
      }))
      .filter(({ bounds }) => (
        screenX >= bounds.x
        && screenX <= bounds.x + bounds.width
        && screenY >= bounds.y
        && screenY <= bounds.y + bounds.height
      ))
      .sort((a, b) => {
        const yDelta = b.platform.y - a.platform.y;
        if (yDelta !== 0) return yDelta;
        return a.index - b.index;
      })
      .at(-1)?.platform || null;
  }, [getPlatformEditorBounds, getRenderablePlatforms]);

  const getPropPalettePreview = useCallback((paletteItem) => {
    const template = paletteItem?.template || paletteItem || {};
    if (paletteItem?.category === 'Trap' || String(paletteItem?.key || '').startsWith('trap:')) {
      const trapPreviewStyles = {
        'collapsing-stone-floor': {
          background:
            'linear-gradient(145deg, rgba(255,255,255,0.2) 0 11%, transparent 12%), linear-gradient(88deg, transparent 0 42%, rgba(30, 18, 9, 0.82) 43% 47%, transparent 48%), linear-gradient(176deg, rgba(36, 22, 10, 0.72) 0 12%, transparent 13%), repeating-linear-gradient(0deg, rgba(56, 34, 16, 0.24) 0 2px, transparent 2px 12px), linear-gradient(180deg, #b99154 0%, #73502a 52%, #3f2a17 100%)',
          boxShadow: 'inset 0 -12px 18px rgba(26, 15, 8, 0.44), inset 0 7px 10px rgba(255, 220, 143, 0.2)',
        },
        'hidden-sand-pit': {
          background:
            'radial-gradient(circle at 50% 55%, rgba(35, 20, 9, 0.9) 0 9%, rgba(84, 50, 22, 0.7) 18%, rgba(175, 114, 49, 0.48) 36%, rgba(223, 166, 83, 0.86) 58%, rgba(126, 76, 31, 0.92) 100%), repeating-radial-gradient(circle at 47% 50%, rgba(255, 226, 147, 0.22) 0 2px, transparent 2px 7px)',
          borderRadius: '50%',
          boxShadow: 'inset 0 8px 12px rgba(255, 218, 129, 0.22), inset 0 -9px 16px rgba(45, 24, 10, 0.52)',
        },
        'dart-launcher': {
          background:
            'linear-gradient(90deg, transparent 0 48%, rgba(240, 205, 125, 0.95) 49% 75%, rgba(40, 24, 12, 0.95) 76% 81%, transparent 82%), radial-gradient(circle at 35% 48%, rgba(15, 10, 7, 0.95) 0 8%, rgba(84, 49, 23, 0.85) 9% 18%, transparent 19%), repeating-linear-gradient(90deg, rgba(42, 26, 13, 0.62) 0 6px, rgba(130, 82, 36, 0.5) 6px 13px), linear-gradient(180deg, #946033 0%, #4b321c 100%)',
          boxShadow: 'inset 0 0 0 2px rgba(229, 180, 92, 0.22), inset 0 -14px 18px rgba(17, 24, 39, 0.56)',
        },
      };
      const trapStyle = trapPreviewStyles[template.type] || trapPreviewStyles['hidden-sand-pit'];
      return {
        assetKey: template.type === 'dart-launcher'
          ? 'wall dart trap'
          : template.type === 'collapsing-stone-floor'
            ? 'cracked floor trap'
            : 'concealed sand pit',
        style: {
          ...trapStyle,
          width: '100%',
          height: '100%',
          borderRadius: trapStyle.borderRadius || '5px',
          backgroundBlendMode: 'normal',
        },
      };
    }
    if (paletteItem?.type === 'platform' || paletteItem?.type === 'floor' || String(paletteItem?.key || '').startsWith('platform:')) {
      const floor = paletteItem?.type === 'floor';
      const blocker = paletteItem?.type === 'blocker';
      const slantShape = template.blockerShape === 'left-slant'
        ? 'polygon(100% 0, 100% 100%, 0 100%)'
        : template.blockerShape === 'right-slant'
          ? 'polygon(0 0, 100% 100%, 0 100%)'
          : undefined;
      return {
        assetKey: blocker
          ? template.blockerShape === 'left-slant'
            ? 'left slant blocker'
            : template.blockerShape === 'right-slant'
              ? 'right slant blocker'
              : 'movement blocker'
          : floor ? 'collision floor' : 'collision platform',
        style: {
          background: blocker
            ? 'linear-gradient(90deg, rgba(45, 212, 191, 0.44), rgba(14, 165, 233, 0.22))'
            : floor
            ? 'linear-gradient(180deg, rgba(253, 224, 71, 0.38), rgba(245, 158, 11, 0.18))'
            : 'linear-gradient(180deg, rgba(251, 191, 36, 0.36), rgba(249, 115, 22, 0.2))',
          border: `2px solid ${blocker ? 'rgba(45, 212, 191, 0.95)' : floor ? 'rgba(253, 224, 71, 0.95)' : 'rgba(251, 146, 60, 0.95)'}`,
          borderRadius: floor ? '3px' : '5px',
          boxShadow: `0 0 12px ${blocker ? 'rgba(45, 212, 191, 0.28)' : 'rgba(253, 224, 71, 0.28)'}`,
          width: blocker ? '34%' : '100%',
          height: floor ? '70%' : blocker ? '92%' : '44%',
          margin: blocker ? '4% auto 0' : undefined,
          marginTop: blocker ? undefined : floor ? '15%' : '28%',
          clipPath: slantShape,
        },
      };
    }
    const generatedPreview = GENERATED_STORY_PROP_PREVIEW_SOURCES[template.type];
    if (generatedPreview) {
      return {
        assetKey: generatedPreview.assetKey,
        style: {
          backgroundImage: `url(${import.meta.env.BASE_URL}${generatedPreview.src})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          width: '100%',
          height: '100%',
        },
      };
    }
    if (template.imageAssetKey && template.assetPath) {
      return {
        assetKey: template.imageAssetKey,
        style: {
          backgroundImage: `url(${import.meta.env.BASE_URL}${template.assetPath})`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          width: '100%',
          height: '100%',
        },
      };
    }
    if (template.collectibleSpriteKey) {
      return {
        assetKey: template.collectibleSpriteKey,
        style: {
          background: 'radial-gradient(circle at 50% 45%, rgba(250, 204, 21, 0.22), transparent 58%), linear-gradient(135deg, rgba(214, 173, 98, 0.95), rgba(77, 48, 24, 0.95))',
          clipPath: 'polygon(22% 12%, 86% 24%, 72% 86%, 20% 76%, 8% 38%)',
          boxShadow: 'inset 0 0 0 2px rgba(252, 211, 77, 0.42), 0 0 10px rgba(250, 204, 21, 0.25)',
          width: '76%',
          height: '76%',
          margin: '12%',
        },
      };
    }
    const candidates = [];
    if (template.atmosphereAssetKey) {
      candidates.push({
        assets: atmosphereEnvironmentAssetsRef.current,
        packId: ENVIRONMENT_ASSET_PACK_IDS.EGYPT_ATMOSPHERE,
        assetKey: template.atmosphereAssetKey,
      });
    }
    if (template.foregroundDetailAssetKey) {
      candidates.push({
        assets: foregroundDepthEnvironmentAssetsRef.current,
        packId: ENVIRONMENT_ASSET_PACK_IDS.EGYPT_FOREGROUND_DEPTH,
        assetKey: template.foregroundDetailAssetKey,
      });
    }
    if (template.groundDetailAssetKey) {
      candidates.push({
        assets: premiumGroundContactAssetsRef.current,
        packId: ENVIRONMENT_ASSET_PACK_IDS.EGYPT_PREMIUM_GROUND_CONTACT,
        assetKey: template.groundDetailAssetKey,
      });
    }
    candidates.push({
      assets: environmentAssetsRef.current,
      packId: environmentAssetsRef.current.packId,
      assetKey: getEnvironmentAssetKeyForStoryProp(template, environmentAssetsRef.current.packId),
    });

    for (const candidate of candidates) {
      const region = candidate.assetKey ? candidate.assets?.atlas?.regions?.[candidate.assetKey] : null;
      const image = candidate.assets?.atlas?.image;
      const atlasSize = candidate.assets?.atlas?.size;
      if (!region || !image || !atlasSize?.w || !atlasSize?.h) continue;
      const packConfig = getEnvironmentAssetPackConfig(candidate.packId);
      const scale = Math.min(0.9, 46 / Math.max(region.w, region.h));
      return {
        assetKey: candidate.assetKey,
        style: {
          backgroundImage: `url(${import.meta.env.BASE_URL}${packConfig.basePath}${image})`,
          backgroundPosition: `${-region.x * scale}px ${-region.y * scale}px`,
          backgroundSize: `${atlasSize.w * scale}px ${atlasSize.h * scale}px`,
          width: `${Math.max(10, region.w * scale)}px`,
          height: `${Math.max(10, region.h * scale)}px`,
        },
      };
    }
    return null;
  }, []);

  const getPropEditorUiState = useCallback((current = stateRef.current) => {
    const editor = propPlacementEditorRef.current;
    const prop = getPropEditorSelectedProp(current);
    const hazard = !prop ? getPropEditorSelectedHazard(current) : null;
    const platform = !prop && !hazard ? getPropEditorSelectedPlatform(current) : null;
    const lair = !prop && !hazard && !platform ? getPropEditorSelectedLair(current) : null;
    const arch = !prop && !hazard && !platform && !lair ? getPropEditorSelectedArch(current) : null;
    const checkpoint = !prop && !hazard && !platform && !arch && !lair ? getPropEditorSelectedCheckpoint(current) : null;
    const nest = !prop && !hazard && !platform && !arch && !lair && !checkpoint ? getPropEditorSelectedNest() : null;
    const roomId = prop
      ? getJourneyPropRoomId(prop, getJourneySceneId(current), current.currentSectionId)
      : hazard
        ? getHazardEditorRoomId(hazard, current)
      : platform
        ? getPlatformEditorRoomId(platform, current)
      : lair
        ? lair.sectionId || getSectionForX(getScarabQueenLairPlacement(lair).x)?.id || getActivePropEditorRoomId(current)
      : arch
        ? getSectionForX((Number(arch.anchorX) || Number(arch.x) || 0))?.id || getActivePropEditorRoomId(current)
      : checkpoint
        ? checkpoint.id
      : getActivePropEditorRoomId(current);
    const paletteSource = editor.selectedPaletteCategory === 'trap'
      ? trapEditorPalette
      : editor.selectedPaletteCategory === 'platform'
        ? platformEditorPalette
        : editor.selectedPaletteCategory === 'ground-detail'
          ? groundDetailsEditorPalette
          : editor.selectedPaletteCategory === 'foreground-detail'
            ? foregroundDetailsEditorPalette
            : editor.selectedPaletteCategory === 'shard-prop'
              ? shardPropsEditorPalette
              : editor.selectedPaletteCategory === 'ledge'
                ? propEditorPalette.filter(item => item.category === 'Ledge Helpers')
                : propEditorPalette;
    const palette = paletteSource
      .map(item => ({ ...item, preview: getPropPalettePreview(item) }))
      .filter(item => item.preview);
    const paletteSourceForCategory = (category) => (
      category === 'trap' ? trapEditorPalette
      : category === 'platform' ? platformEditorPalette
      : category === 'ground-detail' ? groundDetailsEditorPalette
      : category === 'foreground-detail' ? foregroundDetailsEditorPalette
      : category === 'shard-prop' ? shardPropsEditorPalette
      : propEditorPalette
    );
    const recentPaletteItems = (editor.recentPaletteKeys || [])
      .map(({ key, category }) => {
        const item = paletteSourceForCategory(category).find(i => i.key === key);
        if (!item) return null;
        const preview = getPropPalettePreview(item);
        if (!preview) return null;
        return { key, category, label: item.label, preview };
      })
      .filter(Boolean);
    const selectedLockKey = prop
      ? `prop:${prop.id}`
      : platform
        ? `platform:${platform.id || platform.label}`
      : hazard
        ? `hazard:${hazard.id}`
      : arch
        ? `arch:${arch.editorId}`
      : checkpoint
        ? `checkpoint:${checkpoint.id}`
      : lair
        ? `lair:${lair.id}`
      : nest
        ? `nest:${nest.id}`
      : null;
    // Scene Outliner: every prop in the active room, grouped by depth band and sorted
    // by z within the band — the same ordering the renderer and z-order buttons use.
    const outlinerRoomId = getActivePropEditorRoomId(current);
    const outlinerQuery = (editor.outlinerSearch || '').trim().toLowerCase();
    const outlinerProps = getRenderableStoryProps(current)
      .filter(item => item?.id && getJourneyPropRoomId(item, getJourneySceneId(current), current.currentSectionId) === outlinerRoomId)
      .filter(item => !outlinerQuery || `${item.label || item.name || ''} ${item.id}`.toLowerCase().includes(outlinerQuery))
      .map(item => ({
        id: item.id,
        label: item.label || item.name || item.id,
        depth: getStoryPropDepth(item),
        zIndex: Number.isFinite(item.zIndex) ? item.zIndex : 0,
        x: Math.round(Number(item.x) || 0),
        locked: editor.lockedItems.has(`prop:${item.id}`),
        hidden: editor.hiddenIds.has(item.id),
        selected: editor.selectedPropId === item.id,
      }));
    const outlinerGroups = Object.entries(outlinerProps.reduce((groups, item) => {
      (groups[item.depth] ||= []).push(item);
      return groups;
    }, {}))
      .map(([depth, items]) => ({
        depth,
        order: STORY_PROP_DEPTH_ORDER[depth] ?? 99,
        items: items.sort((a, b) => (a.zIndex - b.zIndex) || (a.x - b.x)),
      }))
      .sort((a, b) => a.order - b.order);
    const outlinerRoomTotal = getRenderableStoryProps(current)
      .filter(item => item?.id && getJourneyPropRoomId(item, getJourneySceneId(current), current.currentSectionId) === outlinerRoomId)
      .length;
    const sceneOutliner = {
      roomId: outlinerRoomId,
      groups: outlinerGroups,
      total: outlinerProps.length,
      roomTotal: outlinerRoomTotal,
      search: editor.outlinerSearch || '',
      hiddenCount: editor.hiddenIds.size,
    };
    return {
      enabled: editor.enabled,
      selectedProp: prop ? {
        id: prop.id,
        category: isGeneratedStoryStructureProp(prop) ? 'Structure' : 'Prop',
        roomId,
        x: Math.round(prop.x),
        y: Math.round(prop.y),
        type: prop.type || 'prop',
        width: Math.round(getStoryPropEditorSize(prop).width),
        height: Math.round(getStoryPropEditorSize(prop).height),
        sourceWidth: Math.round(Number.isFinite(prop.width) ? prop.width : getStoryPropEditorSize(prop).width),
        sourceHeight: Math.round(Number.isFinite(prop.height) ? prop.height : getStoryPropEditorSize(prop).height),
        editorBoundsInsetTop: Math.round(Number.isFinite(prop.editorBoundsInsetTop) ? prop.editorBoundsInsetTop : 0),
        editorBoundsInsetRight: Math.round(Number.isFinite(prop.editorBoundsInsetRight) ? prop.editorBoundsInsetRight : 0),
        editorBoundsInsetBottom: Math.round(Number.isFinite(prop.editorBoundsInsetBottom) ? prop.editorBoundsInsetBottom : 0),
        editorBoundsInsetLeft: Math.round(Number.isFinite(prop.editorBoundsInsetLeft) ? prop.editorBoundsInsetLeft : 0),
        yOffset: Math.round(Number.isFinite(prop.yOffset) ? prop.yOffset : 0),
        scale: Number.isFinite(prop.scale) ? prop.scale : 1,
        rotation: Number.isFinite(prop.rotation) ? prop.rotation : 0,
        mirrorX: Boolean(prop.mirrorX),
        mirrorY: Boolean(prop.mirrorY),
        brightness: Number.isFinite(prop.brightness) ? prop.brightness : 1,
        colorGradeFilter: typeof prop.colorGradeFilter === 'string' ? prop.colorGradeFilter : '',
        tintColor: typeof prop.tintColor === 'string' && prop.tintColor ? prop.tintColor : '#b88a4a',
        tintStrength: Number.isFinite(prop.tintStrength) ? prop.tintStrength : 0,
        paintColor: typeof prop.paintColor === 'string' && prop.paintColor ? prop.paintColor : '#7c5a32',
        paintStrength: Number.isFinite(prop.paintStrength) ? prop.paintStrength : 0,
        depth: getStoryPropDepth(prop),
        layer: prop.layer || 'default',
        zIndex: Number.isFinite(prop.zIndex) ? prop.zIndex : 'auto',
        groundContactLayer: Array.isArray(prop.groundContactLayer)
          ? prop.groundContactLayer.map(entry => ({ ...entry }))
          : [],
      } : null,
      selectedPlatform: platform ? {
        id: platform.id || platform.label || 'platform',
        category: isJourneyBlockerPlatform(platform) ? 'Blocker' : isJourneyFloorPlatform(platform) ? 'Floor' : 'Platform',
        roomId,
        x: Math.round(platform.x),
        y: Math.round(platform.y),
        width: Math.round(platform.width),
        height: Math.round(platform.height),
        collision: platform.collision || 'landing',
        blockerShape: platform.blockerShape || 'box',
        depth: isJourneyBlockerPlatform(platform) ? 'blocker/collision' : isJourneyFloorPlatform(platform) ? 'floor/collision' : 'collision',
        layer: platform.layer || (isJourneyBlockerPlatform(platform) ? 'blocker' : isJourneyFloorPlatform(platform) ? 'floor' : 'platform'),
        zIndex: Number.isFinite(platform.zIndex) ? platform.zIndex : 'auto',
      } : null,
      selectedHazard: hazard ? {
        id: hazard.id,
        roomId,
        x: Math.round(hazard.x),
        y: Math.round(hazard.y),
        width: Math.round(hazard.width),
        height: Math.round(hazard.height),
        type: hazard.type || 'legacy-hazard',
        triggerArea: getJourneyTrapTriggerRect(hazard),
        triggerOffset: normalizeJourneyTrap(hazard).triggerArea,
        damage: Number.isFinite(hazard.damage) ? hazard.damage : hazard.penalty?.stamina || 0,
        reset: Boolean(hazard.reset),
        cooldown: Number.isFinite(hazard.cooldown) ? hazard.cooldown : 0,
        depth: hazard.depth || 'grounded',
        direction: hazard.direction || 'right',
        launcherX: Number.isFinite(hazard.launcherX) ? hazard.launcherX : Math.round(hazard.x + hazard.width / 2),
        launcherY: Number.isFinite(hazard.launcherY) ? hazard.launcherY : Math.round(hazard.y - 44),
        editorVisible: hazard.editorVisible !== false,
        linkedObjectIds: Array.isArray(hazard.linkedObjectIds) ? hazard.linkedObjectIds.join(', ') : '',
        burial: getHazardBurialAmount(hazard),
        brightness: Number.isFinite(hazard.brightness) ? hazard.brightness : 1,
        alpha: Number.isFinite(hazard.alpha) ? hazard.alpha : 1,
        colorGradeFilter: hazard.colorGradeFilter || '',
        name: hazard.name || hazard.id,
        penalty: hazard.penalty || {},
        layer: 'hazard',
      } : null,
      selectedArch: arch ? {
        id: arch.id,
        editorId: arch.editorId,
        kind: arch.editorKind === 'doorway' ? 'doorway arch' : 'route gate arch',
        roomId,
        x: Math.round(Number.isFinite(arch.anchorX) ? arch.anchorX : arch.x),
        y: Math.round(arch.y),
        width: Math.round(arch.width),
        height: Math.round(arch.height),
      } : null,
      selectedLair: lair ? {
        id: lair.id,
        name: lair.name || 'Scarab Lair',
        roomId,
        x: Math.round(getScarabQueenLairPlacement(lair).x),
        y: Math.round(getScarabQueenLairPlacement(lair).y),
        width: Math.round(getScarabQueenLairPlacement(lair).width),
        height: Math.round(getScarabQueenLairPlacement(lair).height),
        bossX: Math.round(lair.x),
        bossY: Math.round(lair.y),
        bossWidth: Number.isFinite(lair.width) ? Math.round(lair.width) : '',
        bossHeight: Number.isFinite(lair.height) ? Math.round(lair.height) : '',
        arenaStart: Math.round(lair.arenaStart),
        arenaEnd: Math.round(lair.arenaEnd),
        patrolMin: Number.isFinite(lair.patrolMin) ? Math.round(lair.patrolMin) : '',
        patrolMax: Number.isFinite(lair.patrolMax) ? Math.round(lair.patrolMax) : '',
      } : null,
      selectedCheckpoint: checkpoint ? {
        id: checkpoint.id,
        name: checkpoint.name || checkpoint.id,
        roomId,
        x: Math.round(checkpoint.x),
        y: Math.round(checkpoint.y),
      } : null,
      selectedNest: nest ? (() => {
        const params = getEditedNestParams(nest);
        return {
          id: nest.id,
          name: nest.name || 'Scorpion Nest',
          roomId,
          x: Math.round(params.x),
          y: Math.round(params.y),
          widthScale: Number(params.widthScale.toFixed(2)),
          yOffset: Math.round(params.yOffset),
          glowYFactor: Number(params.glowYFactor.toFixed(2)),
          glowSize: Number(params.glowSize.toFixed(2)),
        };
      })() : null,
      gridSnap: editor.gridSnap,
      gridSize: editor.gridSize,
      paletteOpen: editor.paletteOpen,
      collapsedPaletteGroups: editor.collapsedPaletteGroups || {},
      selectedPaletteKey: editor.selectedPaletteKey,
      selectedPaletteCategory: editor.selectedPaletteCategory,
      recentPaletteItems,
      stampMode: editor.stampMode === true,
      paletteSearch: editor.paletteSearch || '',
      showTrapTriggers: editor.showTrapTriggers,
      showHoverLabels: editor.showHoverLabels !== false,
      previewMode: editor.previewMode,
      panelCollapsed: editor.panelCollapsed,
      floorPickMode: editor.floorPickMode,
      palette,
      selectedLockKey,
      selectedLocked: Boolean(selectedLockKey && editor.lockedItems.has(selectedLockKey)),
      lockedCount: editor.lockedItems.size,
      hasCopiedLook: Boolean(editor.copiedLook),
      unsavedChangeSummary: createJourneyPlacementChangeSummary(editor),
      exportText: editor.exportText,
      aiInstructions: editor.aiInstructions,
      exportVisible: editor.exportVisible,
      savedAt: editor.savedAt,
      writeStatus: editor.writeStatus,
      sceneOutliner,
      stackPicker: editor.stackPicker,
      canUndo: editorUndoStackRef.current.length > 0,
      canRedo: editorRedoStackRef.current.length > 0,
    };
  }, [getActivePropEditorRoomId, getHazardEditorRoomId, getPlatformEditorRoomId, getPropEditorSelectedArch, getPropEditorSelectedCheckpoint, getPropEditorSelectedHazard, getPropEditorSelectedLair, getPropEditorSelectedNest, getEditedNestParams, getPropEditorSelectedPlatform, getPropEditorSelectedProp, getPropPalettePreview, getRenderableStoryProps, getScarabQueenLairPlacement, foregroundDetailsEditorPalette, groundDetailsEditorPalette, platformEditorPalette, propEditorPalette, shardPropsEditorPalette, trapEditorPalette]);

  const persistPropEditorState = useCallback(() => {
    if (!import.meta.env.DEV || typeof window === 'undefined') return;
    try {
      const serialized = serializeJourneyPropEditorState(propPlacementEditorRef.current);
      window.localStorage.setItem(JOURNEY_PROP_EDITOR_STORAGE_KEY, JSON.stringify(serialized));
    } catch {
      // Ignore storage failures (quota exceeded, private mode, disabled storage).
    }
  }, []);

  const schedulePropEditorPersist = useCallback(() => {
    if (!import.meta.env.DEV || typeof window === 'undefined') return;
    if (propEditorPersistTimeoutRef.current) {
      window.clearTimeout(propEditorPersistTimeoutRef.current);
    }
    // Debounce so dragging (which fires every frame) writes at most ~2x/second.
    propEditorPersistTimeoutRef.current = window.setTimeout(() => {
      propEditorPersistTimeoutRef.current = null;
      persistPropEditorState();
    }, 400);
  }, [persistPropEditorState]);

  // Snapshot of the editable layer as a JSON string, used as history entries.
  const snapshotEditorHistoryState = useCallback(() => (
    JSON.stringify(serializeJourneyPropEditorState(propPlacementEditorRef.current))
  ), []);

  // Commit the latest edit burst as one undo step. Pushes the PRE-change baseline
  // onto the undo stack only when the editable layer actually changed, so UI-only
  // actions (selecting, toggling grid) never create history noise.
  const commitEditorHistory = useCallback(() => {
    if (editorHistoryTimeoutRef.current) {
      window.clearTimeout(editorHistoryTimeoutRef.current);
      editorHistoryTimeoutRef.current = null;
    }
    const current = snapshotEditorHistoryState();
    const baseline = editorHistoryBaselineRef.current;
    if (baseline === null) {
      editorHistoryBaselineRef.current = current;
      return;
    }
    if (current === baseline) return;
    editorUndoStackRef.current.push(baseline);
    if (editorUndoStackRef.current.length > 60) editorUndoStackRef.current.shift();
    editorRedoStackRef.current = [];
    editorHistoryBaselineRef.current = current;
  }, [snapshotEditorHistoryState]);

  const scheduleEditorHistoryCommit = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (editorHistoryTimeoutRef.current) window.clearTimeout(editorHistoryTimeoutRef.current);
    // Debounce so a continuous drag coalesces into a single undo step.
    editorHistoryTimeoutRef.current = window.setTimeout(() => {
      editorHistoryTimeoutRef.current = null;
      commitEditorHistory();
    }, 450);
  }, [commitEditorHistory]);

  const refreshPropEditorUi = useCallback(() => {
    setPropEditorUi(getPropEditorUiState());
    schedulePropEditorPersist();
    scheduleEditorHistoryCommit();
  }, [getPropEditorUiState, schedulePropEditorPersist, scheduleEditorHistoryCommit]);

  const clearPropEditorDraftLayer = useCallback(({ clearSelection = true } = {}) => {
    const editor = propPlacementEditorRef.current;
    editor.edits = {};
    editor.platformEdits = {};
    editor.hazardEdits = {};
    editor.routeGateEdits = {};
    editor.routeGateDoorwayEdits = {};
    editor.checkpointEdits = {};
    editor.miniBossEdits = {};
    editor.scorpionNestEdits = {};
    editor.createdProps = [];
    editor.createdPlatforms = [];
    editor.createdHazards = [];
    editor.deletedIds = new Set();
    editor.deletedPlatformIds = new Set();
    editor.deletedHazardIds = new Set();
    if (clearSelection) {
      editor.selectedPropId = null;
      editor.selectedPlatformId = null;
      editor.selectedHazardId = null;
      editor.selectedArchId = null;
      editor.selectedCheckpointId = null;
      editor.selectedLairId = null;
      editor.selectedNestId = null;
    }
    editor.dragging = null;
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(JOURNEY_PROP_EDITOR_STORAGE_KEY);
      } catch {
        // Ignore storage failures.
      }
    }
    if (editorHistoryTimeoutRef.current && typeof window !== 'undefined') {
      window.clearTimeout(editorHistoryTimeoutRef.current);
      editorHistoryTimeoutRef.current = null;
    }
    editorUndoStackRef.current = [];
    editorRedoStackRef.current = [];
    editorHistoryBaselineRef.current = JSON.stringify(serializeJourneyPropEditorState(editor));
  }, []);

  const clearSavedPropEditorState = useCallback(() => {
    clearPropEditorDraftLayer();
    refreshPropEditorUi();
  }, [clearPropEditorDraftLayer, refreshPropEditorUi]);

  const restoreEditorHistoryState = useCallback((serialized) => {
    const editor = propPlacementEditorRef.current;
    const restored = restoreJourneyPropEditorState(JSON.parse(serialized));
    Object.assign(editor, restored);
    pruneObsoleteLostBridgeRavineFloorEditorProps(editor);
    // A restored state may reference items that are no longer selected cleanly.
    editor.dragging = null;
    editorHistoryBaselineRef.current = serialized;
    refreshPropEditorUi();
    persistPropEditorState();
  }, [refreshPropEditorUi, persistPropEditorState]);

  const undoEditorChange = useCallback(() => {
    // Fold any in-progress edit into history first so it can be undone too.
    commitEditorHistory();
    if (editorUndoStackRef.current.length === 0) return;
    const current = snapshotEditorHistoryState();
    const previous = editorUndoStackRef.current.pop();
    editorRedoStackRef.current.push(current);
    restoreEditorHistoryState(previous);
  }, [commitEditorHistory, snapshotEditorHistoryState, restoreEditorHistoryState]);

  const redoEditorChange = useCallback(() => {
    commitEditorHistory();
    if (editorRedoStackRef.current.length === 0) return;
    const current = snapshotEditorHistoryState();
    const next = editorRedoStackRef.current.pop();
    editorUndoStackRef.current.push(current);
    restoreEditorHistoryState(next);
  }, [commitEditorHistory, snapshotEditorHistoryState, restoreEditorHistoryState]);

  useEffect(() => {
    if (!import.meta.env.DEV || typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('clearJourneyEditorDraft') === '1') {
        window.localStorage.removeItem(JOURNEY_PROP_EDITOR_STORAGE_KEY);
      }
      const raw = window.localStorage.getItem(JOURNEY_PROP_EDITOR_STORAGE_KEY);
      if (raw) {
        const restored = restoreJourneyPropEditorState(JSON.parse(raw));
        // The game loop reads this ref every frame, so restored edits show up in the
        // live world immediately; the editor panel picks them up when opened (Shift+E).
        Object.assign(propPlacementEditorRef.current, restored);
        pruneObsoleteLostBridgeRavineFloorEditorProps(propPlacementEditorRef.current);
        pruneRetiredDesertEntryBackgroundEditorProps(propPlacementEditorRef.current);
      }
    } catch {
      // Ignore corrupt saved state — fall back to a clean editor.
    }
    // Seed the undo baseline with whatever we start from (saved edits or empty).
    editorHistoryBaselineRef.current = JSON.stringify(
      serializeJourneyPropEditorState(propPlacementEditorRef.current),
    );
  }, []);

  useEffect(() => () => {
    if (typeof window !== 'undefined') {
      if (propEditorPersistTimeoutRef.current) window.clearTimeout(propEditorPersistTimeoutRef.current);
      if (editorHistoryTimeoutRef.current) window.clearTimeout(editorHistoryTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (!import.meta.env.DEV || !propPlacementEditorRef.current.enabled) return;
    applyDefaultEditorLocks(stateRef.current);
    refreshPropEditorUi();
  }, [applyDefaultEditorLocks, refreshPropEditorUi]);

  const toggleSelectedEditorLock = useCallback(() => {
    const editor = propPlacementEditorRef.current;
    const lockKey = getSelectedEditorLockKey();
    if (!lockKey) return;
    if (editor.lockedItems.has(lockKey)) {
      editor.lockedItems.delete(lockKey);
    } else {
      editor.lockedItems.add(lockKey);
      editor.dragging = null;
    }
    refreshPropEditorUi();
  }, [getSelectedEditorLockKey, refreshPropEditorUi]);

  const getPropEditorPointer = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const screenX = ((event.clientX - rect.left) / rect.width) * CANVAS_WIDTH;
    const screenY = ((event.clientY - rect.top) / rect.height) * CANVAS_HEIGHT;
    const current = stateRef.current;
    const verticalOffset = !isInteriorChamberScene(current) ? current.secretVerticalCameraOffset || 0 : 0;
    return {
      screenX,
      screenY,
      worldX: screenX + current.cameraX,
      worldY: screenY - verticalOffset,
    };
  }, []);

  const findEditableStoryPropAt = useCallback((screenX, screenY) => {
    const current = stateRef.current;
    const cameraX = Number.isFinite(current.cameraX) ? current.cameraX : 0;
    return getRenderableStoryProps(current)
      .map((prop, index) => ({
        prop,
        index,
        bounds: getStoryPropEditorBounds(prop, cameraX, current),
      }))
      .filter(({ bounds }) => (
        screenX >= bounds.x
        && screenX <= bounds.x + bounds.width
        && screenY >= bounds.y
        && screenY <= bounds.y + bounds.height
      ))
      .sort((a, b) => {
        const depthDelta = (STORY_PROP_DEPTH_ORDER[a.bounds.depth] || 0) - (STORY_PROP_DEPTH_ORDER[b.bounds.depth] || 0);
        if (depthDelta !== 0) return depthDelta;
        const zDelta = (Number(a.prop.zIndex) || 0) - (Number(b.prop.zIndex) || 0);
        if (zDelta !== 0) return zDelta;
        const areaDelta = (b.bounds.width * b.bounds.height) - (a.bounds.width * a.bounds.height);
        if (areaDelta !== 0) return areaDelta;
        return a.index - b.index;
      })
      .at(-1)?.prop || null;
  }, [getRenderableStoryProps]);

  // All props under the cursor, top-most first (so [0] matches the single-pick default
  // above). Lets Tab cycle through every stacked prop, not just the top one.
  const findAllEditableStoryPropsAt = useCallback((screenX, screenY) => {
    const current = stateRef.current;
    const cameraX = Number.isFinite(current.cameraX) ? current.cameraX : 0;
    return getRenderableStoryProps(current)
      .map((prop, index) => ({
        prop,
        index,
        bounds: getStoryPropEditorBounds(prop, cameraX, current),
      }))
      .filter(({ bounds }) => (
        screenX >= bounds.x
        && screenX <= bounds.x + bounds.width
        && screenY >= bounds.y
        && screenY <= bounds.y + bounds.height
      ))
      .sort((a, b) => {
        const depthDelta = (STORY_PROP_DEPTH_ORDER[a.bounds.depth] || 0) - (STORY_PROP_DEPTH_ORDER[b.bounds.depth] || 0);
        if (depthDelta !== 0) return depthDelta;
        const zDelta = (Number(a.prop.zIndex) || 0) - (Number(b.prop.zIndex) || 0);
        if (zDelta !== 0) return zDelta;
        const areaDelta = (b.bounds.width * b.bounds.height) - (a.bounds.width * a.bounds.height);
        if (areaDelta !== 0) return areaDelta;
        return a.index - b.index;
      })
      .reverse()
      .map(({ prop }) => prop);
  }, [getRenderableStoryProps]);

  // --- Editor hover: preview what a click will select (plain label) and let Tab cycle
  // through entities stacked under the cursor. Shared by the overlay + pointer/key handlers. ---
  const getEditorEntityBounds = useCallback((descriptor, cameraX, current) => {
    if (!descriptor) return null;
    const { kind, entity } = descriptor;
    switch (kind) {
      case 'hazard': return getHazardEditorBounds(entity, cameraX);
      case 'lair': return getLairEditorBounds(entity, cameraX);
      case 'nest': return getNestEditorBounds(entity, cameraX);
      case 'checkpoint': return getCheckpointEditorBounds(entity, cameraX);
      case 'arch': return getArchEditorBounds(entity, cameraX);
      case 'platform': return getPlatformEditorBounds(entity, cameraX, current);
      case 'prop': return getStoryPropEditorBounds(entity, cameraX, current);
      default: return null;
    }
  }, [getArchEditorBounds, getCheckpointEditorBounds, getHazardEditorBounds, getLairEditorBounds, getNestEditorBounds, getPlatformEditorBounds]);

  const getEditorEntityLabel = useCallback((descriptor) => {
    if (!descriptor) return '';
    const { kind, entity } = descriptor;
    switch (kind) {
      case 'hazard': return `${JOURNEY_TRAP_TYPES[entity.type]?.label || entity.name || 'Trap'} — trap`;
      case 'lair': return `${entity.name || 'Scarab Lair'} — boss lair`;
      case 'nest': return `${entity.name || 'Scorpion Nest'} — spawner`;
      case 'checkpoint': return `${entity.name || 'Checkpoint'} — checkpoint`;
      case 'arch': return entity.editorKind === 'doorway' ? 'Doorway — gate' : 'Route Gate — gate';
      case 'platform': return descriptor.floor ? 'Floor — collision' : `${entity.label || entity.id || 'Platform'} — platform`;
      case 'prop': return `${entity.name || entity.category || 'Prop'} — prop${entity.id ? ` · ${entity.id}` : ''}`;
      default: return '';
    }
  }, []);

  const buildEditorHoverStack = useCallback((screenX, screenY) => {
    const editor = propPlacementEditorRef.current;
    const stack = [];
    const push = (kind, entity, extra = {}) => {
      if (!entity) return;
      const id = entity.id || entity.editorId || entity.label || kind;
      stack.push({ kind, entity, id, ...extra });
    };
    if (editor.floorPickMode) {
      push('platform', findEditablePlatformAt(screenX, screenY, { floorOnly: true }), { floor: true });
      return stack;
    }
    // Same priority order as the click selection cascade so stack[0] === default pick.
    push('hazard', findEditableHazardAt(screenX, screenY));
    push('lair', findEditableScarabLairAt(screenX, screenY));
    push('nest', findEditableNestAt(screenX, screenY));
    push('checkpoint', findEditableCheckpointAt(screenX, screenY));
    push('arch', findEditableArchAt(screenX, screenY));
    push('platform', findEditablePlatformAt(screenX, screenY, { includeFloors: false }));
    // Every prop under the cursor (top-most first), so Tab reaches stacked props.
    findAllEditableStoryPropsAt(screenX, screenY).forEach(prop => push('prop', prop));
    push('platform', findEditablePlatformAt(screenX, screenY, { floorOnly: true }), { floor: true });
    return stack;
  }, [findAllEditableStoryPropsAt, findEditableArchAt, findEditableCheckpointAt, findEditableHazardAt, findEditableNestAt, findEditablePlatformAt, findEditableScarabLairAt]);

  const updateEditorHover = useCallback((screenX, screenY) => {
    const editor = propPlacementEditorRef.current;
    const stack = buildEditorHoverStack(screenX, screenY);
    const signature = stack.map(d => `${d.kind}:${d.id}`).join('|');
    const prev = editor.hover;
    // Keep the cycle index while the cursor stays over the same stack; reset otherwise.
    const index = prev && prev.signature === signature
      ? Math.min(prev.index, Math.max(0, stack.length - 1))
      : 0;
    editor.hover = stack.length ? { signature, stack, index, screenX, screenY } : null;
  }, [buildEditorHoverStack]);

  const savePropPlacementExport = useCallback(() => {
    const editor = propPlacementEditorRef.current;
    const current = stateRef.current;
    const roomId = getActivePropEditorRoomId(current);
    const roomProps = getAllPropEditorStoryProps()
      .filter(prop => getJourneyPropRoomId(prop, getJourneySceneId(current), current.currentSectionId) === roomId)
      .map(prop => getEditedStoryProp(prop))
      .filter(Boolean);
    const roomPlatforms = getAllPropEditorPlatforms()
      .filter(platform => getPlatformEditorRoomId(platform, current) === roomId)
      .map(platform => getEditedPlatform(platform))
      .filter(platform => platform?.id);
    const roomHazards = getAllPropEditorHazards()
      .filter(hazard => getHazardEditorRoomId(hazard, current) === roomId)
      .map(hazard => getEditedHazard(hazard))
      .filter(hazard => hazard?.id);
    const roomRouteGates = getRenderableRouteGates()
      .filter(gate => getSectionForX(Number(gate.x) || 0)?.id === roomId);
    const roomRouteGateDoorways = getRenderableRouteGateDoorways()
      .filter(doorway => getSectionForX(Number.isFinite(doorway.anchorX) ? doorway.anchorX : doorway.blockX || 0)?.id === roomId);
    const roomCheckpoints = getRenderableCheckpoints()
      .filter(checkpoint => getSectionForX(Number(checkpoint.x) || 0)?.id === roomId);
    const roomEnemies = getRenderableScorpionNests()
      .map((enemy) => {
        const params = getEditedNestParams(enemy);
        return {
          id: enemy.id,
          sectionId: enemy.sectionId || getSectionForX(Number(params.x) || 0)?.id || roomId,
          x: Math.round(params.x),
          y: Math.round(params.y),
          width: Math.round(Number(enemy.width) || 1),
          height: Math.round(Number(enemy.height) || 1),
          widthScale: Number(params.widthScale.toFixed(2)),
          yOffset: Math.round(params.yOffset),
          glowYFactor: Number(params.glowYFactor.toFixed(2)),
          glowSize: Number(params.glowSize.toFixed(2)),
        };
      })
      .filter(enemy => enemy?.id && enemy.sectionId === roomId);
    const roomMiniBosses = getJourneyMiniBosses(targetCivilisation)
      .map(boss => getEditedMiniBoss(boss))
      .filter(boss => boss?.id && (boss.sectionId || getSectionForX(Number(boss.x) || 0)?.id) === roomId);
    editor.exportText = createJourneyPropPlacementExport({
      roomId,
      props: roomProps,
      deletedPropIds: [...editor.deletedIds].filter((propId) => {
        const prop = getPropEditorBasePropById(propId);
        return prop && getJourneyPropRoomId(prop, getJourneySceneId(current), current.currentSectionId) === roomId;
      }),
      platforms: roomPlatforms,
      deletedPlatformIds: [...editor.deletedPlatformIds].filter((platformId) => {
        const platform = getPlatformEditorBasePlatformById(platformId);
        return platform && getPlatformEditorRoomId(platform, current) === roomId;
      }),
      hazards: roomHazards,
      deletedHazardIds: [...editor.deletedHazardIds].filter((hazardId) => {
        const hazard = getHazardEditorBaseHazardById(hazardId);
        return hazard && getHazardEditorRoomId(hazard, current) === roomId;
      }),
      routeGates: roomRouteGates,
      routeGateDoorways: roomRouteGateDoorways,
      checkpoints: roomCheckpoints,
      enemies: roomEnemies,
      miniBosses: roomMiniBosses,
    });
    editor.aiInstructions = createJourneyPlacementAiInstructions(editor, { roomId });
    editor.exportVisible = true;
    editor.savedAt = new Date().toLocaleTimeString();
    refreshPropEditorUi();
  }, [getActivePropEditorRoomId, getAllPropEditorHazards, getAllPropEditorPlatforms, getAllPropEditorStoryProps, getEditedHazard, getEditedMiniBoss, getEditedNestParams, getEditedPlatform, getEditedStoryProp, getHazardEditorBaseHazardById, getHazardEditorRoomId, getPlatformEditorBasePlatformById, getPlatformEditorRoomId, getPropEditorBasePropById, getRenderableCheckpoints, getRenderableRouteGateDoorways, getRenderableRouteGates, getRenderableScorpionNests, refreshPropEditorUi, targetCivilisation]);

  // Closes the save loop: build the same per-room export, then POST it to the DEV-only
  // Vite endpoint that rewrites journeyPlacementOverrides.generated.js in place — no more
  // copy-JSON-then-run-npm step. No-op outside `npm run dev`.
  const writeJourneyOverridesToSource = useCallback(async () => {
    if (!import.meta.env.DEV) return;
    const editor = propPlacementEditorRef.current;
    savePropPlacementExport();
    const payload = editor.exportText;
    editor.writeStatus = { state: 'writing', message: 'Writing to source…' };
    refreshPropEditorUi();
    try {
      const response = await fetch('/__journey/write-overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok && result.ok) {
        const savedCounts = [
          result.props ? `${result.props} prop(s)` : null,
          result.enemies ? `${result.enemies} enemy(s)` : null,
        ].filter(Boolean).join(' + ') || '0 item(s)';
        editor.writeStatus = {
          state: 'ok',
          message: `Saved to source · ${savedCounts} · editor draft cleared`,
          at: new Date().toLocaleTimeString(),
        };
        clearPropEditorDraftLayer();
      } else {
        editor.writeStatus = {
          state: 'error',
          message: result.error || `Write failed (HTTP ${response.status})`,
          at: new Date().toLocaleTimeString(),
        };
      }
    } catch (error) {
      editor.writeStatus = {
        state: 'error',
        message: `Write failed: ${error.message}`,
        at: new Date().toLocaleTimeString(),
      };
    }
    refreshPropEditorUi();
  }, [clearPropEditorDraftLayer, refreshPropEditorUi, savePropPlacementExport]);

  const deleteSelectedPropFromEditor = useCallback(() => {
    const editor = propPlacementEditorRef.current;
    if (isEditorLockKeyLocked(getSelectedEditorLockKey())) {
      editor.dragging = null;
      refreshPropEditorUi();
      return;
    }
    const selectedId = editor.selectedPropId;
    if (selectedId) {
      const selectedProp = getPropEditorSelectedProp();
      if (!selectedProp) return;
      const confirmed = window.confirm(`Delete prop "${selectedProp.id}" from ${getJourneyPropRoomId(selectedProp, getJourneySceneId(stateRef.current), stateRef.current.currentSectionId)}?`);
      if (!confirmed) return;
      const createdIndex = editor.createdProps.findIndex(prop => prop.id === selectedId);
      const sourcePropExists = STORY_PROPS.some(prop => prop.id === selectedId);
      if (createdIndex >= 0) {
        editor.createdProps.splice(createdIndex, 1);
      }
      if (sourcePropExists || createdIndex < 0) {
        editor.deletedIds.add(selectedId);
      }
      delete editor.edits[selectedId];
      editor.selectedPropId = null;
      editor.dragging = null;
      refreshPropEditorUi();
      return;
    }
    const selectedPlatform = getPropEditorSelectedPlatform();
    const platformId = selectedPlatform?.id || selectedPlatform?.label;
    if (platformId) {
      const confirmed = window.confirm(`Delete platform "${platformId}" from ${getPlatformEditorRoomId(selectedPlatform, stateRef.current)}?`);
      if (!confirmed) return;
      const createdIndex = editor.createdPlatforms.findIndex(platform => (platform.id || platform.label) === platformId);
      if (createdIndex >= 0) {
        editor.createdPlatforms.splice(createdIndex, 1);
      } else {
        editor.deletedPlatformIds.add(platformId);
      }
      delete editor.platformEdits[platformId];
      editor.selectedPlatformId = null;
      editor.dragging = null;
      refreshPropEditorUi();
      return;
    }
    const selectedHazard = getPropEditorSelectedHazard();
    if (selectedHazard?.id) {
      const confirmed = window.confirm(`Delete trap "${selectedHazard.id}" from ${getHazardEditorRoomId(selectedHazard, stateRef.current)}?`);
      if (!confirmed) return;
      const createdIndex = editor.createdHazards.findIndex(hazard => hazard.id === selectedHazard.id);
      if (createdIndex >= 0) {
        editor.createdHazards.splice(createdIndex, 1);
      } else {
        editor.deletedHazardIds.add(selectedHazard.id);
      }
      delete editor.hazardEdits[selectedHazard.id];
      editor.selectedHazardId = null;
      editor.dragging = null;
      refreshPropEditorUi();
    }
  }, [getHazardEditorRoomId, getPlatformEditorRoomId, getPropEditorSelectedHazard, getPropEditorSelectedPlatform, getPropEditorSelectedProp, getSelectedEditorLockKey, isEditorLockKeyLocked, refreshPropEditorUi]);

  const getPropEditorExistingIds = useCallback(() => getAllPropEditorStoryProps().map(prop => prop.id), [getAllPropEditorStoryProps]);

  const getHazardEditorExistingIds = useCallback(() => getAllPropEditorHazards().map(hazard => hazard.id), [getAllPropEditorHazards]);

  const getPlatformEditorExistingIds = useCallback(() => (
    getAllPropEditorPlatforms().map(platform => platform.id || platform.label).filter(Boolean)
  ), [getAllPropEditorPlatforms]);

  const getGroundAwareStoryPropEditorEdit = useCallback((prop, edit = {}) => {
    const nextEdit = { ...edit };
    if (!Number.isFinite(edit.y)) return nextEdit;
    const nextProp = { ...prop, ...edit };
    const nextSize = getStoryPropEditorSize(nextProp);
    const explicitGroundY = getStoryPropExplicitGroundY(nextSize);
    if (Number.isFinite(explicitGroundY)) {
      nextEdit.yOffset = Math.round(edit.y - explicitGroundY);
    }
    return nextEdit;
  }, []);

  const updateSelectedPropEditorTransform = useCallback((edit) => {
    const editor = propPlacementEditorRef.current;
    const selectedProp = getPropEditorSelectedProp();
    if (!selectedProp) return;
    if (isEditorEntityLocked('prop', selectedProp.id)) return;
    const nextEdit = getGroundAwareStoryPropEditorEdit(selectedProp, edit);
    editor.edits[selectedProp.id] = {
      ...(editor.edits[selectedProp.id] || {}),
      ...nextEdit,
    };
    refreshPropEditorUi();
  }, [getGroundAwareStoryPropEditorEdit, getPropEditorSelectedProp, isEditorEntityLocked, refreshPropEditorUi]);

  // Reorder the selected prop within its depth band. Props only stack against other
  // props in the SAME depth (background/midground/grounded/route-edge/foreground-occluder);
  // zIndex is the tie-breaker inside a band, so front/back compute against same-band siblings.
  const nudgeSelectedPropZOrder = useCallback((mode) => {
    const selectedProp = getPropEditorSelectedProp();
    if (!selectedProp) return;
    if (isEditorEntityLocked('prop', selectedProp.id)) return;
    const depth = getStoryPropDepth(selectedProp);
    const currentZ = Number.isFinite(Number(selectedProp.zIndex)) ? Number(selectedProp.zIndex) : 0;
    const siblingZ = getRenderableStoryProps()
      .filter(prop => prop.id !== selectedProp.id && getStoryPropDepth(prop) === depth)
      .map(prop => (Number.isFinite(Number(prop.zIndex)) ? Number(prop.zIndex) : 0));
    const maxZ = siblingZ.length ? Math.max(...siblingZ) : currentZ;
    const minZ = siblingZ.length ? Math.min(...siblingZ) : currentZ;
    const nextZ = mode === 'front' ? maxZ + 1
      : mode === 'back' ? minZ - 1
      : mode === 'forward' ? currentZ + 1
      : mode === 'backward' ? currentZ - 1
      : currentZ;
    updateSelectedPropEditorTransform({ zIndex: Math.round(nextZ) });
  }, [getPropEditorSelectedProp, getRenderableStoryProps, isEditorEntityLocked, updateSelectedPropEditorTransform]);

  // Copy the selected prop's colour look (grade + brightness) so it can be stamped
  // onto other props — speeds up keeping a whole scene's props tonally consistent.
  const copySelectedPropLook = useCallback(() => {
    const selectedProp = getPropEditorSelectedProp();
    if (!selectedProp) return;
    const editor = propPlacementEditorRef.current;
    editor.copiedLook = {
      colorGradeFilter: typeof selectedProp.colorGradeFilter === 'string' ? selectedProp.colorGradeFilter : '',
      brightness: Number.isFinite(selectedProp.brightness) ? selectedProp.brightness : 1,
      tintColor: typeof selectedProp.tintColor === 'string' ? selectedProp.tintColor : '',
      tintStrength: Number.isFinite(selectedProp.tintStrength) ? selectedProp.tintStrength : 0,
      paintColor: typeof selectedProp.paintColor === 'string' ? selectedProp.paintColor : '',
      paintStrength: Number.isFinite(selectedProp.paintStrength) ? selectedProp.paintStrength : 0,
    };
    refreshPropEditorUi();
  }, [getPropEditorSelectedProp, refreshPropEditorUi]);

  const pasteSelectedPropLook = useCallback(() => {
    const look = propPlacementEditorRef.current.copiedLook;
    if (!look) return;
    updateSelectedPropEditorTransform({
      colorGradeFilter: look.colorGradeFilter,
      brightness: look.brightness,
      ...(typeof look.tintColor === 'string' && look.tintColor ? { tintColor: look.tintColor } : {}),
      tintStrength: Number.isFinite(look.tintStrength) ? look.tintStrength : 0,
      ...(typeof look.paintColor === 'string' && look.paintColor ? { paintColor: look.paintColor } : {}),
      paintStrength: Number.isFinite(look.paintStrength) ? look.paintStrength : 0,
    });
  }, [updateSelectedPropEditorTransform]);

  // One-click golden-hour blend: applies the desaturate/warm/dim recipe + a soft
  // grounding shadow so a "pasted-looking" prop settles into the desert scene.
  const blendSelectedPropIntoScene = useCallback(() => {
    updateSelectedPropEditorTransform({ ...JOURNEY_PROP_SCENE_BLEND_RECIPE });
  }, [updateSelectedPropEditorTransform]);

  const updateSelectedPropEditorField = useCallback((field, value) => {
    const editor = propPlacementEditorRef.current;
    const selectedProp = getPropEditorSelectedProp();
    if (!selectedProp) return;
    editor.edits[selectedProp.id] = {
      ...(editor.edits[selectedProp.id] || {}),
      [field]: value,
    };
    // Controlled inputs (colour sliders) need the snapshot rebuilt so the new
    // value flows back to them; uncontrolled inputs are unaffected by the refresh.
    refreshPropEditorUi();
  }, [getPropEditorSelectedProp, refreshPropEditorUi]);

  const updateSelectedPropEditorNumberField = useCallback((field, value, {
    min = -Infinity,
    max = Infinity,
    round = false,
    decimals = null,
  } = {}) => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return;
    const clampedValue = clamp(numericValue, min, max);
    const nextValue = round
      ? Math.round(clampedValue)
      : decimals !== null
        ? Number(clampedValue.toFixed(decimals))
        : clampedValue;
    updateSelectedPropEditorField(field, nextValue);
  }, [updateSelectedPropEditorField]);

  const updateSelectedPropGroundContactLayer = useCallback((index, edit = {}) => {
    const selectedProp = getPropEditorSelectedProp();
    if (!selectedProp) return;
    const currentLayers = selectedProp.groundContactLayer || [];
    const nextLayers = [...currentLayers];
    if (index >= nextLayers.length) {
      nextLayers.push({
        assetKey: 'premiumSmallStoneScatter',
        layer: 'overlay',
        xRatio: 0.5,
        widthRatio: 0.24,
        height: 28,
        yOffset: -42,
        rotation: 0,
        alpha: 0.48,
        mirrorX: false,
        filter: 'sepia(0%) saturate(104%) brightness(96%) contrast(98%)',
      });
    }
    nextLayers[index] = { ...nextLayers[index], ...edit };
    updateSelectedPropEditorField('groundContactLayer', nextLayers);
    refreshPropEditorUi();
  }, [getPropEditorSelectedProp, refreshPropEditorUi, updateSelectedPropEditorField]);

  const removeSelectedPropGroundContactLayer = useCallback((index) => {
    const selectedProp = getPropEditorSelectedProp();
    if (!selectedProp) return;
    const currentLayers = selectedProp.groundContactLayer || [];
    const nextLayers = currentLayers.filter((_, i) => i !== index);
    updateSelectedPropEditorField('groundContactLayer', nextLayers);
    refreshPropEditorUi();
  }, [getPropEditorSelectedProp, refreshPropEditorUi, updateSelectedPropEditorField]);

  const updateSelectedPlatformEditorTransform = useCallback((edit) => {
    const editor = propPlacementEditorRef.current;
    const selectedPlatform = getPropEditorSelectedPlatform();
    const platformId = selectedPlatform?.id || selectedPlatform?.label;
    if (!platformId) return;
    if (isEditorEntityLocked('platform', platformId)) return;
    editor.platformEdits[platformId] = {
      ...(editor.platformEdits[platformId] || {}),
      ...edit,
    };
    refreshPropEditorUi();
  }, [getPropEditorSelectedPlatform, isEditorEntityLocked, refreshPropEditorUi]);

  const updateSelectedHazardEditorTransform = useCallback((edit) => {
    const editor = propPlacementEditorRef.current;
    const selectedHazard = getPropEditorSelectedHazard();
    if (!selectedHazard?.id) return;
    if (isEditorEntityLocked('hazard', selectedHazard.id)) return;
    editor.hazardEdits[selectedHazard.id] = {
      ...(editor.hazardEdits[selectedHazard.id] || {}),
      ...edit,
    };
    refreshPropEditorUi();
  }, [getPropEditorSelectedHazard, isEditorEntityLocked, refreshPropEditorUi]);

  const updateSelectedArchEditorTransform = useCallback((edit) => {
    const editor = propPlacementEditorRef.current;
    const selectedArch = getPropEditorSelectedArch();
    if (!selectedArch?.id) return;
    if (isEditorEntityLocked('arch', selectedArch.editorId)) return;
    if (selectedArch.editorKind === 'doorway') {
      editor.routeGateDoorwayEdits[selectedArch.id] = {
        ...(editor.routeGateDoorwayEdits[selectedArch.id] || {}),
        ...edit,
      };
    } else {
      editor.routeGateEdits[selectedArch.id] = {
        ...(editor.routeGateEdits[selectedArch.id] || {}),
        ...edit,
      };
    }
    refreshPropEditorUi();
  }, [getPropEditorSelectedArch, isEditorEntityLocked, refreshPropEditorUi]);

  const updateSelectedCheckpointEditorTransform = useCallback((edit) => {
    const editor = propPlacementEditorRef.current;
    const selectedCheckpoint = getPropEditorSelectedCheckpoint();
    if (!selectedCheckpoint?.id) return;
    if (isEditorEntityLocked('checkpoint', selectedCheckpoint.id)) return;
    editor.checkpointEdits[selectedCheckpoint.id] = {
      ...(editor.checkpointEdits[selectedCheckpoint.id] || {}),
      ...edit,
    };
    refreshPropEditorUi();
  }, [getPropEditorSelectedCheckpoint, isEditorEntityLocked, refreshPropEditorUi]);

  const updateSelectedLairEditorTransform = useCallback((edit) => {
    const editor = propPlacementEditorRef.current;
    const selectedLair = getPropEditorSelectedLair();
    if (!selectedLair?.id) return;
    if (isEditorEntityLocked('lair', selectedLair.id)) return;
    editor.miniBossEdits[selectedLair.id] = {
      ...(editor.miniBossEdits[selectedLair.id] || {}),
      ...edit,
    };
    refreshPropEditorUi();
  }, [getPropEditorSelectedLair, isEditorEntityLocked, refreshPropEditorUi]);

  const updateSelectedNestEditorTransform = useCallback((edit) => {
    const editor = propPlacementEditorRef.current;
    const selectedNest = getPropEditorSelectedNest();
    if (!selectedNest?.id) return;
    if (isEditorEntityLocked('nest', selectedNest.id)) return;
    editor.scorpionNestEdits[selectedNest.id] = {
      ...(editor.scorpionNestEdits[selectedNest.id] || {}),
      ...edit,
    };
    refreshPropEditorUi();
  }, [getPropEditorSelectedNest, isEditorEntityLocked, refreshPropEditorUi]);

  const resetSelectedNestEditor = useCallback(() => {
    const editor = propPlacementEditorRef.current;
    const selectedNest = getPropEditorSelectedNest();
    if (!selectedNest?.id) return;
    if (isEditorEntityLocked('nest', selectedNest.id)) return;
    delete editor.scorpionNestEdits[selectedNest.id];
    refreshPropEditorUi();
  }, [getPropEditorSelectedNest, isEditorEntityLocked, refreshPropEditorUi]);

  const duplicateSelectedPropInEditor = useCallback(() => {
    const editor = propPlacementEditorRef.current;
    const selectedProp = getPropEditorSelectedProp();
    if (!selectedProp) return;
    if (isEditorEntityLocked('prop', selectedProp.id)) return;
    const duplicate = duplicateJourneyPropForEditor({
      prop: selectedProp,
      existingIds: getPropEditorExistingIds(),
    });
    editor.createdProps.push(duplicate);
    editor.selectedPropId = duplicate.id;
    editor.selectedPlatformId = null;
    editor.selectedHazardId = null;
    editor.selectedArchId = null;
    editor.selectedCheckpointId = null;
    editor.selectedLairId = null;
    editor.selectedNestId = null;
    editor.edits[duplicate.id] = {};
    editor.deletedIds.delete(duplicate.id);
    editor.paletteOpen = false;
    refreshPropEditorUi();
  }, [getPropEditorExistingIds, getPropEditorSelectedProp, isEditorEntityLocked, refreshPropEditorUi]);

  const createPropFromEditorPalette = useCallback((pointer) => {
    const editor = propPlacementEditorRef.current;
    const propPaletteSource = editor.selectedPaletteCategory === 'ground-detail'
      ? groundDetailsEditorPalette
      : editor.selectedPaletteCategory === 'foreground-detail'
        ? foregroundDetailsEditorPalette
      : editor.selectedPaletteCategory === 'shard-prop'
        ? shardPropsEditorPalette
      : propEditorPalette;
    const paletteItem = propPaletteSource.find(item => item.key === editor.selectedPaletteKey);
    if (!paletteItem) return null;
    const roomId = getActivePropEditorRoomId(stateRef.current);
    const nextProp = createJourneyPropFromPaletteItem({
      paletteItem,
      roomId,
      x: editor.gridSnap ? snapJourneyPropCoordinate(pointer.worldX, editor.gridSize) : Math.round(pointer.worldX),
      y: editor.gridSnap ? snapJourneyPropCoordinate(pointer.worldY, editor.gridSize) : Math.round(pointer.worldY),
      existingIds: getPropEditorExistingIds(),
    });
    Object.assign(nextProp, getGroundAwareStoryPropEditorEdit(nextProp, { y: nextProp.y }));
    editor.createdProps.push(nextProp);
    editor.selectedPropId = nextProp.id;
    editor.selectedPlatformId = null;
    editor.selectedHazardId = null;
    editor.selectedArchId = null;
    editor.selectedCheckpointId = null;
    editor.selectedLairId = null;
    editor.selectedNestId = null;
    editor.recentPaletteKeys = [
      { key: paletteItem.key, category: editor.selectedPaletteCategory },
      ...(editor.recentPaletteKeys || []).filter(r => r.key !== paletteItem.key),
    ].slice(0, 8);
    if (!editor.stampMode) {
      editor.selectedPaletteKey = null;
      editor.paletteOpen = false;
    }
    editor.deletedIds.delete(nextProp.id);
    refreshPropEditorUi();
    return nextProp;
  }, [getActivePropEditorRoomId, getGroundAwareStoryPropEditorEdit, getPropEditorExistingIds, foregroundDetailsEditorPalette, groundDetailsEditorPalette, propEditorPalette, refreshPropEditorUi, shardPropsEditorPalette]);

  const createTrapFromEditorPalette = useCallback((pointer) => {
    const editor = propPlacementEditorRef.current;
    const paletteItem = trapEditorPalette.find(item => item.key === editor.selectedPaletteKey);
    if (!paletteItem) return null;
    const roomId = getActivePropEditorRoomId(stateRef.current);
    const nextTrap = createJourneyTrapFromPaletteItem({
      paletteItem,
      roomId,
      x: editor.gridSnap ? snapJourneyPropCoordinate(pointer.worldX, editor.gridSize) : Math.round(pointer.worldX),
      y: editor.gridSnap ? snapJourneyPropCoordinate(pointer.worldY, editor.gridSize) : Math.round(pointer.worldY),
      existingIds: getHazardEditorExistingIds(),
    });
    editor.createdHazards.push(nextTrap);
    editor.selectedPropId = null;
    editor.selectedPlatformId = null;
    editor.selectedHazardId = nextTrap.id;
    editor.selectedArchId = null;
    editor.selectedCheckpointId = null;
    editor.selectedLairId = null;
    editor.selectedNestId = null;
    editor.recentPaletteKeys = [
      { key: paletteItem.key, category: 'trap' },
      ...(editor.recentPaletteKeys || []).filter(r => r.key !== paletteItem.key),
    ].slice(0, 8);
    if (!editor.stampMode) {
      editor.selectedPaletteKey = null;
      editor.paletteOpen = false;
    }
    editor.deletedHazardIds.delete(nextTrap.id);
    refreshPropEditorUi();
    return nextTrap;
  }, [getActivePropEditorRoomId, getHazardEditorExistingIds, refreshPropEditorUi, trapEditorPalette]);

  const createPlatformFromEditorPalette = useCallback((pointer) => {
    const editor = propPlacementEditorRef.current;
    const paletteItem = platformEditorPalette.find(item => item.key === editor.selectedPaletteKey);
    if (!paletteItem) return null;
    const roomId = getActivePropEditorRoomId(stateRef.current);
    const nextPlatform = createJourneyPlatformFromPaletteItem({
      paletteItem,
      roomId,
      x: editor.gridSnap ? snapJourneyPropCoordinate(pointer.worldX, editor.gridSize) : Math.round(pointer.worldX),
      y: editor.gridSnap ? snapJourneyPropCoordinate(pointer.worldY, editor.gridSize) : Math.round(pointer.worldY),
      existingIds: getPlatformEditorExistingIds(),
    });
    editor.createdPlatforms.push(nextPlatform);
    editor.selectedPropId = null;
    editor.selectedPlatformId = nextPlatform.id || nextPlatform.label;
    editor.selectedHazardId = null;
    editor.selectedArchId = null;
    editor.selectedCheckpointId = null;
    editor.selectedLairId = null;
    editor.selectedNestId = null;
    editor.recentPaletteKeys = [
      { key: paletteItem.key, category: 'platform' },
      ...(editor.recentPaletteKeys || []).filter(r => r.key !== paletteItem.key),
    ].slice(0, 8);
    if (!editor.stampMode) {
      editor.selectedPaletteKey = null;
      editor.paletteOpen = false;
    }
    editor.deletedPlatformIds.delete(nextPlatform.id || nextPlatform.label);
    refreshPropEditorUi();
    return nextPlatform;
  }, [getActivePropEditorRoomId, getPlatformEditorExistingIds, platformEditorPalette, refreshPropEditorUi]);

  return {
    propEditorUi,
    toggleEditorPanelSection,
    getPropEditorSelectedProp,
    getPropEditorSelectedPlatform,
    getPropEditorSelectedHazard,
    getPropEditorSelectedArch,
    getPropEditorSelectedCheckpoint,
    getPropEditorSelectedLair,
    getPropEditorSelectedNest,
    getSelectedEditorLockKey,
    isEditorLockKeyLocked,
    isEditorEntityLocked,
    applyDefaultEditorLocks,
    toggleSelectedEditorLock,
    getLairEditorBounds,
    getNestEditorBounds,
    getArchEditorBounds,
    getCheckpointEditorBounds,
    getHazardEditorBounds,
    getPlatformEditorBounds,
    findEditableScarabLairAt,
    findEditableNestAt,
    findEditableArchAt,
    findEditableCheckpointAt,
    findEditableHazardAt,
    findEditablePlatformAt,
    findEditableStoryPropAt,
    findAllEditableStoryPropsAt,
    getEditorEntityBounds,
    getEditorEntityLabel,
    buildEditorHoverStack,
    updateEditorHover,
    getPropEditorPointer,
    getPropEditorUiState,
    persistPropEditorState,
    schedulePropEditorPersist,
    snapshotEditorHistoryState,
    commitEditorHistory,
    scheduleEditorHistoryCommit,
    restoreEditorHistoryState,
    undoEditorChange,
    redoEditorChange,
    clearSavedPropEditorState,
    clearPropEditorDraftLayer,
    refreshPropEditorUi,
    getGroundAwareStoryPropEditorEdit,
    updateSelectedPropEditorTransform,
    updateSelectedPropEditorField,
    updateSelectedPropEditorNumberField,
    updateSelectedPropGroundContactLayer,
    removeSelectedPropGroundContactLayer,
    updateSelectedPlatformEditorTransform,
    updateSelectedHazardEditorTransform,
    updateSelectedArchEditorTransform,
    updateSelectedCheckpointEditorTransform,
    updateSelectedLairEditorTransform,
    updateSelectedNestEditorTransform,
    resetSelectedNestEditor,
    nudgeSelectedPropZOrder,
    copySelectedPropLook,
    pasteSelectedPropLook,
    blendSelectedPropIntoScene,
    duplicateSelectedPropInEditor,
    deleteSelectedPropFromEditor,
    getPropEditorExistingIds,
    getHazardEditorExistingIds,
    getPlatformEditorExistingIds,
    createPropFromEditorPalette,
    createTrapFromEditorPalette,
    createPlatformFromEditorPalette,
    savePropPlacementExport,
    writeJourneyOverridesToSource,
    getPropPalettePreview,
  };
}
