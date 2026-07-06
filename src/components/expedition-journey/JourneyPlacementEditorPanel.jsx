import { JOURNEY_PROP_PALETTE_DOCK_KEY } from './journeyConstants.js';

const PROP_EDITOR_PALETTE_TITLES = {
  'arch-prop': 'Architecture palette',
  'env-prop': 'Atmosphere palette',
  'bridge-floor-prop': 'Bridges & Floors palette',
  'sacred-prop': 'Camp & Sacred palette',
  trap: 'Trap palette',
  platform: 'Platform palette',
  'ground-detail': 'Ground Details palette',
  'foreground-detail': 'Foreground Details palette',
  'shard-prop': 'Shards palette',
  ledge: 'Ledge palette',
};

export function JourneyPlacementEditorStackPicker({
  stackPicker,
  onDismiss,
  onSelectEntity,
}) {
  if (!stackPicker) return null;

  return (
              <>
                <div
                  className="journey-prop-editor-stackpicker-backdrop"
                  onPointerDown={onDismiss}
                  style={{ position: 'fixed', inset: 0, zIndex: 59 }}
                />
                <div
                  className="journey-prop-editor-stackpicker"
                  style={{
                    position: 'fixed',
                    left: Math.min(stackPicker.clientX + 4, (typeof window !== 'undefined' ? window.innerWidth : 1920) - 240),
                    top: Math.min(stackPicker.clientY + 4, (typeof window !== 'undefined' ? window.innerHeight : 1080) - 40 - stackPicker.items.length * 26),
                    zIndex: 60,
                    minWidth: 200,
                    maxWidth: 320,
                    maxHeight: 360,
                    overflowY: 'auto',
                    background: 'rgba(8, 13, 22, 0.97)',
                    border: '1px solid rgba(214, 158, 73, 0.55)',
                    borderRadius: 6,
                    padding: 4,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    fontSize: 12,
                  }}
                >
                  <div style={{ fontSize: 10, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.04em', padding: '2px 6px 4px' }}>
                    {stackPicker.items.length} under cursor
                  </div>
                  {stackPicker.items.map((item, index) => (
                    <button
                      key={`${item.kind}:${item.id}:${index}`}
                      type="button"
                      disabled={item.locked}
                      onClick={() => onSelectEntity(item.kind, item.id)}
                      title={item.locked ? 'Locked — unlock to select' : `Select ${item.id}`}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '4px 6px',
                        borderRadius: 3,
                        border: 'none',
                        background: 'none',
                        color: item.locked ? 'rgba(255,255,255,0.4)' : '#f8fafc',
                        cursor: item.locked ? 'not-allowed' : 'pointer',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.locked ? '🔒 ' : ''}{item.label}
                    </button>
                  ))}
                </div>
              </>
  );
}

export function JourneyPlacementEditorPanel({
  propEditorUi,
  collapsedPanelSections,
  outlinerOpen,
  setOutlinerOpen,
  setEditorPanelNode,
  handleEditorPanelDragStart,
  resetEditorPanelPosition,
  renderEditorSectionHeader,
  refreshPropEditorUi,
  propPlacementEditorRef,
  undoEditorChange,
  redoEditorChange,
  savePropPlacementExport,
  writeJourneyOverridesToSource,
  showAllEditorProps,
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
  toggleSelectedEditorLock,
  selectEditorPropFromOutliner,
  toggleEditorPropHidden,
  toggleEditorPropLockFromOutliner,
  setEditorOutlinerSearch,
  copySelectedPropLook,
  pasteSelectedPropLook,
  blendSelectedPropIntoScene,
  nudgeSelectedPropZOrder,
  clearSavedPropEditorState,
  filterJourneyPaletteBySearch,
  buildJourneyTintGradeFilter,
  clamp,
  DEFAULT_JOURNEY_PROP_EDITOR_GRID_SIZE,
  PROP_EDITOR_DEPTH_OPTIONS,
  PROP_EDITOR_LAYER_OPTIONS,
  JOURNEY_PROP_TINT_PRESETS,
  JOURNEY_TRAP_DIRECTIONS,
  JOURNEY_TRAP_TYPES,
  parseColorGradeFilter,
  composeColorGradeFilter,
}) {
  const handlePaletteSearchChange = (event) => {
    propPlacementEditorRef.current.paletteSearch = event.target.value;
    refreshPropEditorUi();
  };

  const handlePaletteSearchKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      const ed = propPlacementEditorRef.current;
      if (String(ed.paletteSearch || '').trim()) {
        ed.paletteSearch = '';
      } else {
        ed.paletteOpen = false;
        ed.selectedPaletteKey = null;
      }
      refreshPropEditorUi();
      return;
    }
    if (event.key === 'Enter') {
      const ed = propPlacementEditorRef.current;
      const filteredPalette = filterJourneyPaletteBySearch(propEditorUi.palette, ed.paletteSearch);
      if (filteredPalette.length > 0) {
        event.preventDefault();
        ed.selectedPaletteKey = filteredPalette[0].key;
        refreshPropEditorUi();
      }
    }
  };

  return (
    <>
            {import.meta.env.DEV && propEditorUi.enabled && (
              <div
                className={`journey-prop-editor-panel${propEditorUi.panelCollapsed ? ' is-collapsed' : ''}`}
                aria-live="polite"
                ref={setEditorPanelNode}
              >
                <div
                  className="journey-prop-editor-header"
                  onPointerDown={handleEditorPanelDragStart}
                  onDoubleClick={resetEditorPanelPosition}
                  title="Drag to move · double-click to reset position"
                >
                <div className="journey-prop-editor-topline">
                  <strong>EDIT MODE</strong>
                  <span className="journey-prop-editor-drag-hint" aria-hidden="true">⠿ drag</span>
                  <span>{propEditorUi.gridSnap ? `Grid ${propEditorUi.gridSize}` : 'Free move'}</span>
                  <button
                    type="button"
                    className="journey-prop-editor-collapse"
                    aria-expanded={!propEditorUi.panelCollapsed}
                    title={propEditorUi.panelCollapsed ? 'Expand editor panel' : 'Collapse editor panel (show more canvas)'}
                    onClick={() => {
                      propPlacementEditorRef.current.panelCollapsed = !propPlacementEditorRef.current.panelCollapsed;
                      refreshPropEditorUi();
                    }}
                  >
                    {propEditorUi.panelCollapsed ? '▸' : '▾'}
                  </button>
                </div>
                <div className="journey-prop-editor-actions" aria-label="Editor actions">
                  <div className="journey-prop-editor-action-group" role="group" aria-label="Actions">
                  <span className="journey-prop-editor-action-group-label">Actions</span>
                  <div className="journey-prop-editor-action-buttons">
                  <button
                    type="button"
                    disabled={!propEditorUi.canUndo}
                    title="Undo (Ctrl+Z)"
                    onClick={undoEditorChange}
                  >
                    ↶ Undo
                  </button>
                  <button
                    type="button"
                    disabled={!propEditorUi.canRedo}
                    title="Redo (Ctrl+Shift+Z)"
                    onClick={redoEditorChange}
                  >
                    ↷ Redo
                  </button>
                  <button type="button" title="Build the placement export (JSON + AI instructions) and open the export panel" onClick={savePropPlacementExport}>
                    Build export
                  </button>
                  <button
                    type="button"
                    title="Write the export straight into journeyPlacementOverrides.generated.js (dev server only)"
                    onClick={writeJourneyOverridesToSource}
                    disabled={propEditorUi.writeStatus?.state === 'writing'}
                  >
                    {propEditorUi.writeStatus?.state === 'writing' ? 'Writing…' : '💾 Write to file'}
                  </button>
                  </div>
                  {propEditorUi.writeStatus && (
                    <div
                      className={`journey-prop-editor-write-status is-${propEditorUi.writeStatus.state}`}
                      role="status"
                      style={{
                        marginTop: 4,
                        fontSize: 11,
                        color: propEditorUi.writeStatus.state === 'error'
                          ? '#ffb4a8'
                          : propEditorUi.writeStatus.state === 'ok'
                            ? '#9be7a0'
                            : '#e6c98a',
                      }}
                    >
                      {propEditorUi.writeStatus.state === 'ok' ? '✓ ' : propEditorUi.writeStatus.state === 'error' ? '⚠ ' : ''}
                      {propEditorUi.writeStatus.message}
                      {propEditorUi.writeStatus.at ? ` · ${propEditorUi.writeStatus.at}` : ''}
                    </div>
                  )}
                  </div>
                  <div className="journey-prop-editor-action-group" role="group" aria-label="Modes">
                  <span className="journey-prop-editor-action-group-label">Modes</span>
                  <div className="journey-prop-editor-action-buttons">
                  <button
                    type="button"
                    className={propEditorUi.paletteOpen ? 'is-selected' : ''}
                    onClick={() => {
                      propPlacementEditorRef.current.paletteOpen = !propPlacementEditorRef.current.paletteOpen;
                      if (!propPlacementEditorRef.current.paletteOpen) propPlacementEditorRef.current.selectedPaletteKey = null;
                      refreshPropEditorUi();
                    }}
                  >
                    {propEditorUi.paletteOpen ? '✓ Palette' : 'Palette'}
                  </button>
                  <button
                    type="button"
                    className={propEditorUi.gridSnap ? 'is-selected' : ''}
                    onClick={() => {
                      propPlacementEditorRef.current.gridSnap = !propPlacementEditorRef.current.gridSnap;
                      refreshPropEditorUi();
                    }}
                  >
                    {propEditorUi.gridSnap ? '✓ Grid' : 'Grid'}
                  </button>
                  <button
                    type="button"
                    className={propEditorUi.showTrapTriggers ? 'is-selected' : ''}
                    onClick={() => {
                      propPlacementEditorRef.current.showTrapTriggers = !propPlacementEditorRef.current.showTrapTriggers;
                      refreshPropEditorUi();
                    }}
                  >
                    {propEditorUi.showTrapTriggers ? '✓ Triggers' : 'Triggers'}
                  </button>
                  <button
                    type="button"
                    className={propEditorUi.showHoverLabels ? 'is-selected' : ''}
                    title="Show/hide the floating name label when hovering a prop (the dashed outline stays either way)"
                    onClick={() => {
                      propPlacementEditorRef.current.showHoverLabels = propPlacementEditorRef.current.showHoverLabels === false;
                      refreshPropEditorUi();
                    }}
                  >
                    {propEditorUi.showHoverLabels ? '✓ Labels' : 'Labels'}
                  </button>
                  <button
                    type="button"
                    className={propEditorUi.previewMode ? 'is-selected' : ''}
                    title="Hide selection border + overlay to preview the object's real look (H)"
                    onClick={() => {
                      propPlacementEditorRef.current.previewMode = !propPlacementEditorRef.current.previewMode;
                      refreshPropEditorUi();
                    }}
                  >
                    {propEditorUi.previewMode ? '✓ Preview' : 'Preview'}
                  </button>
                  <button
                    type="button"
                    className={propEditorUi.floorPickMode ? 'is-selected' : ''}
                    title="Floor-pick mode: clicks select only the invisible collision floors, ignoring props"
                    onClick={() => {
                      propPlacementEditorRef.current.floorPickMode = !propPlacementEditorRef.current.floorPickMode;
                      refreshPropEditorUi();
                    }}
                  >
                    {propEditorUi.floorPickMode ? '✓ Floors' : 'Floors'}
                  </button>
                  </div>
                  {propEditorUi.gridSnap && (
                    <label className="journey-prop-editor-grid" style={{ marginTop: 6 }}>
                      <span>Grid size</span>
                      <input
                        type="number"
                        min="2"
                        max="128"
                        step="1"
                        value={propEditorUi.gridSize}
                        onChange={(event) => {
                          const nextGridSize = clamp(Number(event.target.value), 2, 128);
                          propPlacementEditorRef.current.gridSize = Number.isFinite(nextGridSize)
                            ? Math.round(nextGridSize)
                            : DEFAULT_JOURNEY_PROP_EDITOR_GRID_SIZE;
                          refreshPropEditorUi();
                        }}
                      />
                    </label>
                  )}
                  </div>
                </div>
                </div>
                {renderEditorSectionHeader('shortcuts', '⌨ Keyboard shortcuts')}
                {propEditorUi.selectedProp && (
                  <div
                    className="journey-prop-editor-quick-controls"
                    aria-label="Selected prop quick controls"
                    onPointerDown={(event) => event.stopPropagation()}
                  >
                    <label>
                      <span>X</span>
                      <input
                        type="number"
                        step="1"
                        value={propEditorUi.selectedProp.x}
                        onChange={(event) => {
                          const nextX = Number(event.target.value);
                          if (Number.isFinite(nextX)) updateSelectedPropEditorTransform({ x: Math.round(nextX) });
                        }}
                      />
                    </label>
                    <label>
                      <span>Y</span>
                      <input
                        type="number"
                        step="1"
                        value={propEditorUi.selectedProp.y}
                        onChange={(event) => {
                          const nextY = Number(event.target.value);
                          if (Number.isFinite(nextY)) updateSelectedPropEditorTransform({ y: Math.round(nextY) });
                        }}
                      />
                    </label>
                    <label>
                      <span>Scale</span>
                      <input
                        type="number"
                        min="0.1"
                        max="6"
                        step="0.05"
                        value={Number((propEditorUi.selectedProp.scale ?? 1).toFixed(2))}
                        onChange={(event) => {
                          const nextScale = clamp(Number(event.target.value), 0.1, 6);
                          if (Number.isFinite(nextScale)) updateSelectedPropEditorTransform({ scale: Number(nextScale.toFixed(2)) });
                        }}
                      />
                    </label>
                    <label>
                      <span>Width</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={propEditorUi.selectedProp.sourceWidth ?? propEditorUi.selectedProp.width ?? ''}
                        onChange={(event) => {
                          const nextWidth = Number(event.target.value);
                          if (Number.isFinite(nextWidth)) updateSelectedPropEditorTransform({ width: Math.max(1, Math.round(nextWidth)) });
                        }}
                      />
                    </label>
                    <label>
                      <span>Height</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={propEditorUi.selectedProp.sourceHeight ?? propEditorUi.selectedProp.height ?? ''}
                        onChange={(event) => {
                          const nextHeight = Number(event.target.value);
                          if (Number.isFinite(nextHeight)) updateSelectedPropEditorTransform({ height: Math.max(1, Math.round(nextHeight)) });
                        }}
                      />
                    </label>
                  </div>
                )}
                {!collapsedPanelSections['shortcuts'] && (
                  <div className="journey-prop-editor-shortcuts" style={{ fontSize: 11, lineHeight: 1.7, opacity: 0.85, margin: '2px 0 8px', padding: '0 2px' }}>
                    <div><strong>Shift+E</strong> — toggle editor</div>
                    <div><strong>Arrows</strong> — nudge selected (×10 with Shift)</div>
                    <div><strong>; / '</strong> — raise / lower anchor (Y offset)</div>
                    <div><strong>Q / R</strong> — rotate · <strong>+ / −</strong> — scale</div>
                    <div><strong>F / V</strong> — flip horizontal / vertical</div>
                    <div><strong>Tab</strong> / <strong>right-click</strong> — cycle / list stacked items</div>
                    <div><strong>G / P / T / H</strong> — toggle grid / palette / triggers / preview</div>
                    <div><strong>Ctrl+Z / Ctrl+Shift+Z</strong> — undo / redo</div>
                    <div><strong>Ctrl+S</strong> — build export · <strong>Ctrl+D</strong> — duplicate</div>
                  </div>
                )}
                {propEditorUi.sceneOutliner && (
                  <div className="journey-prop-editor-outliner" style={{ marginBottom: 8 }}>
                    <div
                      className="journey-prop-editor-group-header"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                      onClick={() => setOutlinerOpen(open => !open)}
                    >
                      <span>{outlinerOpen ? '▾' : '▸'} Scene · {propEditorUi.sceneOutliner.search
                        ? `${propEditorUi.sceneOutliner.total} / ${propEditorUi.sceneOutliner.roomTotal}`
                        : propEditorUi.sceneOutliner.total} props</span>
                      {propEditorUi.sceneOutliner.hiddenCount > 0 && (
                        <button
                          type="button"
                          style={{ fontSize: 10, padding: '1px 6px' }}
                          onClick={(event) => { event.stopPropagation(); showAllEditorProps(); }}
                          title="Show every hidden prop again"
                        >
                          Show all ({propEditorUi.sceneOutliner.hiddenCount})
                        </button>
                      )}
                    </div>
                    {outlinerOpen && (
                      <>
                      <input
                        type="search"
                        value={propEditorUi.sceneOutliner.search}
                        placeholder="Filter props by name or id…"
                        onChange={(event) => setEditorOutlinerSearch(event.target.value)}
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          margin: '4px 0 2px',
                          padding: '3px 6px',
                          fontSize: 11,
                          borderRadius: 3,
                          border: '1px solid rgba(214, 158, 73, 0.4)',
                          background: 'rgba(0,0,0,0.3)',
                          color: '#f8fafc',
                        }}
                      />
                      <div style={{ maxHeight: 340, overflowY: 'auto', marginTop: 4 }}>
                        {propEditorUi.sceneOutliner.groups.length === 0 && (
                          <div className="journey-prop-editor-empty">
                            {propEditorUi.sceneOutliner.search ? 'No props match your filter' : 'No props in this room yet'}
                          </div>
                        )}
                        {propEditorUi.sceneOutliner.groups.map(group => (
                          <div key={group.depth} className="journey-prop-editor-outliner-group">
                            <div style={{ fontSize: 10, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '4px 0 2px' }}>
                              {group.depth} · {group.items.length}
                            </div>
                            {group.items.map(item => (
                              <div
                                key={item.id}
                                className={`journey-prop-editor-outliner-row${item.selected ? ' is-selected' : ''}`}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  padding: '2px 4px',
                                  borderRadius: 3,
                                  fontSize: 11,
                                  background: item.selected ? 'rgba(214, 158, 73, 0.26)' : 'transparent',
                                  opacity: item.hidden ? 0.5 : 1,
                                }}
                              >
                                <button
                                  type="button"
                                  title={item.hidden ? 'Show prop' : 'Hide prop (editor view only)'}
                                  onClick={() => toggleEditorPropHidden(item.id)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 12, lineHeight: 1 }}
                                >
                                  {item.hidden ? '🚫' : '👁'}
                                </button>
                                <button
                                  type="button"
                                  title={item.locked ? 'Unlock prop' : 'Lock prop'}
                                  onClick={() => toggleEditorPropLockFromOutliner(item.id)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 11, lineHeight: 1 }}
                                >
                                  {item.locked ? '🔒' : '🔓'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => selectEditorPropFromOutliner(item.id)}
                                  title={`${item.id} · z${item.zIndex} · x${item.x} — click to select & center`}
                                  style={{
                                    flex: 1,
                                    textAlign: 'left',
                                    background: 'none',
                                    border: 'none',
                                    color: 'inherit',
                                    cursor: 'pointer',
                                    padding: 0,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    fontWeight: item.selected ? 700 : 400,
                                  }}
                                >
                                  {item.label}
                                </button>
                                <span style={{ fontSize: 9, opacity: 0.5 }}>z{item.zIndex}</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                      </>
                    )}
                  </div>
                )}
                {propEditorUi.selectedProp ? (
                  <div className="journey-prop-editor-readout">
                    <div><span>{propEditorUi.selectedProp.category}</span><strong>{propEditorUi.selectedProp.id}</strong></div>
                    <div><span>Type</span><strong>{propEditorUi.selectedProp.type}</strong></div>
                    <div><span>Room</span><strong>{propEditorUi.selectedProp.roomId}</strong></div>
                    <div><span>X</span><strong>{propEditorUi.selectedProp.x}</strong></div>
                    <div><span>Y</span><strong>{propEditorUi.selectedProp.y}</strong></div>
                    <div><span>Y offset</span><strong>{propEditorUi.selectedProp.yOffset}</strong></div>
                    <div><span>Width</span><strong>{propEditorUi.selectedProp.width}</strong></div>
                    <div><span>Height</span><strong>{propEditorUi.selectedProp.height}</strong></div>
                    <div><span>Scale</span><strong>{(propEditorUi.selectedProp.scale ?? 1).toFixed(2)}</strong></div>
                    <div><span>Rotation</span><strong>{Math.round(propEditorUi.selectedProp.rotation ?? 0)} deg</strong></div>
                    <div><span>Flip</span><strong>{[propEditorUi.selectedProp.mirrorX ? 'H' : null, propEditorUi.selectedProp.mirrorY ? 'V' : null].filter(Boolean).join('+') || 'none'}</strong></div>
                    <div><span>Brightness</span><strong>{(propEditorUi.selectedProp.brightness ?? 1).toFixed(2)}</strong></div>
                    <div><span>Depth</span><strong>{propEditorUi.selectedProp.depth}</strong></div>
                    <div><span>Layer</span><strong>{propEditorUi.selectedProp.layer}</strong></div>
                    <div><span>Z-index</span><strong>{propEditorUi.selectedProp.zIndex}</strong></div>
                  </div>
                ) : propEditorUi.selectedHazard ? (
                  <div className="journey-prop-editor-readout">
                    <div><span>Trap</span><strong>{propEditorUi.selectedHazard.id}</strong></div>
                    <div><span>Name</span><strong>{propEditorUi.selectedHazard.name}</strong></div>
                    <div><span>Type</span><strong>{JOURNEY_TRAP_TYPES[propEditorUi.selectedHazard.type]?.label || propEditorUi.selectedHazard.type}</strong></div>
                    <div><span>Room</span><strong>{propEditorUi.selectedHazard.roomId}</strong></div>
                    <div><span>X</span><strong>{propEditorUi.selectedHazard.x}</strong></div>
                    <div><span>Y</span><strong>{propEditorUi.selectedHazard.y}</strong></div>
                    <div><span>Width</span><strong>{propEditorUi.selectedHazard.width}</strong></div>
                    <div><span>Height</span><strong>{propEditorUi.selectedHazard.height}</strong></div>
                    <div><span>Damage</span><strong>{propEditorUi.selectedHazard.damage}</strong></div>
                    <div><span>Cooldown</span><strong>{propEditorUi.selectedHazard.cooldown.toFixed(2)}</strong></div>
                    <div><span>Burial</span><strong>{(propEditorUi.selectedHazard.burial || 0).toFixed(2)}</strong></div>
                    <div><span>Triggers</span><strong>{propEditorUi.showTrapTriggers ? 'shown' : 'hidden'}</strong></div>
                  </div>
                ) : propEditorUi.selectedPlatform ? (
                  <div className="journey-prop-editor-readout">
                    <div><span>{propEditorUi.selectedPlatform.category}</span><strong>{propEditorUi.selectedPlatform.id}</strong></div>
                    <div><span>Room</span><strong>{propEditorUi.selectedPlatform.roomId}</strong></div>
                    <div><span>X</span><strong>{propEditorUi.selectedPlatform.x}</strong></div>
                    <div><span>Y</span><strong>{propEditorUi.selectedPlatform.y}</strong></div>
                    <div><span>Width</span><strong>{propEditorUi.selectedPlatform.width}</strong></div>
                    <div><span>Height</span><strong>{propEditorUi.selectedPlatform.height}</strong></div>
                    <div><span>Depth</span><strong>{propEditorUi.selectedPlatform.depth}</strong></div>
                    <div><span>Collision</span><strong>{propEditorUi.selectedPlatform.collision}</strong></div>
                    <div><span>Shape</span><strong>{propEditorUi.selectedPlatform.blockerShape}</strong></div>
                    <div><span>Layer</span><strong>{propEditorUi.selectedPlatform.layer}</strong></div>
                    <div><span>Z-index</span><strong>{propEditorUi.selectedPlatform.zIndex}</strong></div>
                  </div>
                ) : propEditorUi.selectedArch ? (
                  <div className="journey-prop-editor-readout">
                    <div><span>Arch</span><strong>{propEditorUi.selectedArch.id}</strong></div>
                    <div><span>Kind</span><strong>{propEditorUi.selectedArch.kind}</strong></div>
                    <div><span>Room</span><strong>{propEditorUi.selectedArch.roomId}</strong></div>
                    <div><span>X</span><strong>{propEditorUi.selectedArch.x}</strong></div>
                    <div><span>Y</span><strong>{propEditorUi.selectedArch.y}</strong></div>
                    <div><span>Width</span><strong>{propEditorUi.selectedArch.width}</strong></div>
                    <div><span>Height</span><strong>{propEditorUi.selectedArch.height}</strong></div>
                  </div>
                ) : propEditorUi.selectedLair ? (
                  <div className="journey-prop-editor-readout">
                    <div><span>Scarab Lair</span><strong>{propEditorUi.selectedLair.id}</strong></div>
                    <div><span>Name</span><strong>{propEditorUi.selectedLair.name}</strong></div>
                    <div><span>Room</span><strong>{propEditorUi.selectedLair.roomId}</strong></div>
                    <div><span>X</span><strong>{propEditorUi.selectedLair.x}</strong></div>
                    <div><span>Y</span><strong>{propEditorUi.selectedLair.y}</strong></div>
                    <div><span>Width</span><strong>{propEditorUi.selectedLair.width}</strong></div>
                    <div><span>Height</span><strong>{propEditorUi.selectedLair.height}</strong></div>
                    <div><span>Boss X</span><strong>{propEditorUi.selectedLair.bossX}</strong></div>
                    <div><span>Boss Y</span><strong>{propEditorUi.selectedLair.bossY}</strong></div>
                    <div><span>Arena Start</span><strong>{propEditorUi.selectedLair.arenaStart}</strong></div>
                    <div><span>Arena End</span><strong>{propEditorUi.selectedLair.arenaEnd}</strong></div>
                    <div><span>Patrol</span><strong>{`${propEditorUi.selectedLair.patrolMin || 'auto'} / ${propEditorUi.selectedLair.patrolMax || 'auto'}`}</strong></div>
                  </div>
                ) : propEditorUi.selectedCheckpoint ? (
                  <div className="journey-prop-editor-readout">
                    <div><span>Checkpoint</span><strong>{propEditorUi.selectedCheckpoint.id}</strong></div>
                    <div><span>Name</span><strong>{propEditorUi.selectedCheckpoint.name}</strong></div>
                    <div><span>Room</span><strong>{propEditorUi.selectedCheckpoint.roomId}</strong></div>
                    <div><span>X</span><strong>{propEditorUi.selectedCheckpoint.x}</strong></div>
                    <div><span>Y</span><strong>{propEditorUi.selectedCheckpoint.y}</strong></div>
                  </div>
                ) : propEditorUi.selectedNest ? (
                  <div className="journey-prop-editor-readout">
                    <div><span>Scorpion Nest</span><strong>{propEditorUi.selectedNest.id}</strong></div>
                    <div><span>Name</span><strong>{propEditorUi.selectedNest.name}</strong></div>
                    <div><span>Room</span><strong>{propEditorUi.selectedNest.roomId}</strong></div>
                    <div><span>X</span><strong>{propEditorUi.selectedNest.x}</strong></div>
                    <div><span>Y</span><strong>{propEditorUi.selectedNest.y}</strong></div>
                    <div><span>Size</span><strong>{propEditorUi.selectedNest.widthScale}</strong></div>
                    <div><span>Anchor</span><strong>{propEditorUi.selectedNest.yOffset}</strong></div>
                    <div><span>Glow Y</span><strong>{propEditorUi.selectedNest.glowYFactor}</strong></div>
                    <div><span>Glow Size</span><strong>{propEditorUi.selectedNest.glowSize}</strong></div>
                  </div>
                ) : (
                  <div className="journey-prop-editor-empty">Nothing selected — click an item on the canvas, or open the Palette to place one.</div>
                )}
                {propEditorUi.selectedLockKey && (
                  <button
                    type="button"
                    className={`journey-prop-editor-selection-lock${propEditorUi.selectedLocked ? ' is-selected' : ''}`}
                    onClick={toggleSelectedEditorLock}
                    title={propEditorUi.selectedLocked ? 'Locked — click to unlock for editing' : 'Click to lock this item and protect it from edits'}
                    style={{ width: '100%', margin: '6px 0 8px', padding: '5px 8px', borderRadius: 4, cursor: 'pointer', textAlign: 'left', fontSize: 12 }}
                  >
                    {propEditorUi.selectedLocked ? '🔒 Locked — click to unlock' : '🔓 Unlocked — click to lock'}
                  </button>
                )}
                {propEditorUi.selectedProp && (
                  <>
                    {renderEditorSectionHeader('prop-transform', 'Transform')}
                    <div className="journey-prop-editor-controls" style={collapsedPanelSections['prop-transform'] ? { display: 'none' } : undefined}>
                      <label>
                        <span>X</span>
                        <input
                          key={`${propEditorUi.selectedProp.id}-editorBoundsInsetTop`}
                          type="number"
                          step="1"
                          value={propEditorUi.selectedProp.x}
                          onChange={(event) => {
                            const nextX = Number(event.target.value);
                            if (Number.isFinite(nextX)) updateSelectedPropEditorTransform({ x: Math.round(nextX) });
                          }}
                        />
                      </label>
                      <label>
                        <span>Y</span>
                        <input
                          key={`${propEditorUi.selectedProp.id}-editorBoundsInsetRight`}
                          type="number"
                          step="1"
                          value={propEditorUi.selectedProp.y}
                          onChange={(event) => {
                            const nextY = Number(event.target.value);
                            if (Number.isFinite(nextY)) updateSelectedPropEditorTransform({ y: Math.round(nextY) });
                          }}
                        />
                      </label>
                      <label title="Anchor: ; lifts, ' drops (hold Shift for x10)">
                        <span>Y offset ; '</span>
                        <input
                          key={`${propEditorUi.selectedProp.id}-editorBoundsInsetBottom`}
                          type="number"
                          step="1"
                          value={propEditorUi.selectedProp.yOffset ?? ''}
                          onChange={(event) => {
                            const nextYOffset = Number(event.target.value);
                            if (Number.isFinite(nextYOffset)) updateSelectedPropEditorTransform({ yOffset: Math.round(nextYOffset) });
                          }}
                        />
                      </label>
                      <label>
                        <span>Width (px)</span>
                        <input
                          key={`${propEditorUi.selectedProp.id}-editorBoundsInsetLeft`}
                          type="number"
                          min="1"
                          step="1"
                          value={propEditorUi.selectedProp.sourceWidth ?? ''}
                          onChange={(event) => {
                            const nextWidth = Number(event.target.value);
                            if (Number.isFinite(nextWidth)) updateSelectedPropEditorTransform({ width: Math.max(1, Math.round(nextWidth)) });
                          }}
                        />
                      </label>
                      <label>
                        <span>Height</span>
                        <input
                          key={`${propEditorUi.selectedProp.id}-brightness`}
                          type="number"
                          min="1"
                          step="1"
                          value={propEditorUi.selectedProp.sourceHeight ?? ''}
                          onChange={(event) => {
                            const nextHeight = Number(event.target.value);
                            if (Number.isFinite(nextHeight)) {
                              const height = Math.max(1, Math.round(nextHeight));
                              updateSelectedPropEditorTransform({
                                height,
                                ...(propEditorUi.selectedProp.category === 'Structure'
                                  ? { y: propEditorUi.selectedProp.y + (propEditorUi.selectedProp.sourceHeight || height) - height }
                                  : {}),
                              });
                            }
                          }}
                        />
                      </label>
                      <label>
                        <span>Scale</span>
                        <input
                          type="number"
                          min="0.1"
                          max="6"
                          step="0.05"
                          value={Number((propEditorUi.selectedProp.scale ?? 1).toFixed(2))}
                          onChange={(event) => {
                            const nextScale = clamp(Number(event.target.value), 0.1, 6);
                            if (Number.isFinite(nextScale)) updateSelectedPropEditorTransform({ scale: Number(nextScale.toFixed(2)) });
                          }}
                        />
                      </label>
                      <label>
                        <span>Width ×</span>
                        <input
                          type="number"
                          min="0.2"
                          max="3"
                          step="0.05"
                          value={Number((propEditorUi.selectedProp.widthScale ?? 1).toFixed(2))}
                          onChange={(event) => {
                            const nextWidthScale = clamp(Number(event.target.value), 0.2, 3);
                            if (Number.isFinite(nextWidthScale)) updateSelectedPropEditorTransform({ widthScale: Number(nextWidthScale.toFixed(2)) });
                          }}
                        />
                      </label>
                      <label>
                        <span>Rotation</span>
                        <input
                          type="number"
                          step="5"
                          value={Math.round(propEditorUi.selectedProp.rotation ?? 0)}
                          onChange={(event) => {
                            const nextRotation = Number(event.target.value);
                            if (Number.isFinite(nextRotation)) updateSelectedPropEditorTransform({ rotation: Math.round(nextRotation) });
                          }}
                        />
                      </label>
                      <label className="journey-prop-editor-checkbox">
                        <span>Flip H</span>
                        <input
                          type="checkbox"
                          checked={propEditorUi.selectedProp.mirrorX || false}
                          onChange={(event) => updateSelectedPropEditorTransform({ mirrorX: event.target.checked })}
                        />
                      </label>
                      <label className="journey-prop-editor-checkbox">
                        <span>Flip V</span>
                        <input
                          type="checkbox"
                          checked={propEditorUi.selectedProp.mirrorY || false}
                          onChange={(event) => updateSelectedPropEditorTransform({ mirrorY: event.target.checked })}
                        />
                      </label>
                      <label>
                        <span>Depth</span>
                        <select
                          value={propEditorUi.selectedProp.depth}
                          onChange={(event) => updateSelectedPropEditorTransform({ depth: event.target.value })}
                        >
                          {PROP_EDITOR_DEPTH_OPTIONS.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span>Layer</span>
                        <select
                          value={propEditorUi.selectedProp.layer || 'default'}
                          onChange={(event) => updateSelectedPropEditorTransform({ layer: event.target.value })}
                        >
                          {(PROP_EDITOR_LAYER_OPTIONS.includes(propEditorUi.selectedProp.layer || 'default')
                            ? PROP_EDITOR_LAYER_OPTIONS
                            : [...PROP_EDITOR_LAYER_OPTIONS, propEditorUi.selectedProp.layer]
                          ).map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span>Z-order</span>
                        <div className="journey-prop-editor-zorder">
                          <button type="button" title="Send to back (behind same-depth props)" onClick={() => nudgeSelectedPropZOrder('back')}>«</button>
                          <button type="button" title="Send backward one step" onClick={() => nudgeSelectedPropZOrder('backward')}>‹</button>
                          <button type="button" title="Bring forward one step" onClick={() => nudgeSelectedPropZOrder('forward')}>›</button>
                          <button type="button" title="Bring to front (above same-depth props)" onClick={() => nudgeSelectedPropZOrder('front')}>»</button>
                        </div>
                      </label>
                      <label>
                        <span>Z-index</span>
                        <input
                          type="number"
                          step="1"
                          placeholder="auto"
                          value={Number.isFinite(Number(propEditorUi.selectedProp.zIndex)) ? propEditorUi.selectedProp.zIndex : ''}
                          onChange={(event) => {
                            const nextZIndex = Number(event.target.value);
                          if (Number.isFinite(nextZIndex)) updateSelectedPropEditorTransform({ zIndex: Math.round(nextZIndex) });
                        }}
                      />
                    </label>
                  </div>

                    {renderEditorSectionHeader('prop-box', 'Editor Box')}
                    <div className="journey-prop-editor-controls" style={collapsedPanelSections['prop-box'] ? { display: 'none' } : undefined}>
                      <label>
                        <span>Trim top</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          defaultValue={propEditorUi.selectedProp.editorBoundsInsetTop}
                          onChange={(event) => {
                            const nextInset = Number(event.target.value);
                            if (Number.isFinite(nextInset)) updateSelectedPropEditorNumberField('editorBoundsInsetTop', nextInset, { min: 0, round: true });
                          }}
                        />
                      </label>
                      <label>
                        <span>Trim right</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          defaultValue={propEditorUi.selectedProp.editorBoundsInsetRight}
                          onChange={(event) => {
                            const nextInset = Number(event.target.value);
                            if (Number.isFinite(nextInset)) updateSelectedPropEditorNumberField('editorBoundsInsetRight', nextInset, { min: 0, round: true });
                          }}
                        />
                      </label>
                      <label>
                        <span>Trim bottom</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          defaultValue={propEditorUi.selectedProp.editorBoundsInsetBottom}
                          onChange={(event) => {
                            const nextInset = Number(event.target.value);
                            if (Number.isFinite(nextInset)) updateSelectedPropEditorNumberField('editorBoundsInsetBottom', nextInset, { min: 0, round: true });
                          }}
                        />
                      </label>
                      <label>
                        <span>Trim left</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          defaultValue={propEditorUi.selectedProp.editorBoundsInsetLeft}
                          onChange={(event) => {
                            const nextInset = Number(event.target.value);
                            if (Number.isFinite(nextInset)) updateSelectedPropEditorNumberField('editorBoundsInsetLeft', nextInset, { min: 0, round: true });
                          }}
                        />
                      </label>
                    </div>

                    {renderEditorSectionHeader('prop-colour', 'Colour & Light')}
                    {!collapsedPanelSections['prop-colour'] && (
                    <>
                    <div className="journey-prop-editor-color-presets">
                      <button type="button" onClick={copySelectedPropLook} title="Copy this prop's colour grade + brightness">Copy look</button>
                      <button
                        type="button"
                        onClick={pasteSelectedPropLook}
                        disabled={!propEditorUi.hasCopiedLook}
                        title={propEditorUi.hasCopiedLook ? 'Apply the copied look to this prop' : 'Copy a look first'}
                      >
                        Paste look
                      </button>
                      <button
                        type="button"
                        onClick={blendSelectedPropIntoScene}
                        title="Apply the golden-hour desert blend (desaturate + warm + dim + soft shadow) so this prop stops looking pasted-on"
                      >
                        Blend into scene
                      </button>
                    </div>
                    {(() => {
                      const grade = parseColorGradeFilter(propEditorUi.selectedProp.colorGradeFilter);
                      const brightnessValue = Number((propEditorUi.selectedProp.brightness ?? 1).toFixed(2));
                      const setGrade = (patch) => updateSelectedPropEditorField('colorGradeFilter', composeColorGradeFilter({ ...grade, ...patch }));
                      return (
                        <div className="journey-prop-editor-color">
                          <div className="journey-prop-editor-color-presets">
                            {JOURNEY_PROP_TINT_PRESETS.map(preset => (
                              <button
                                key={preset.key}
                                type="button"
                                className={propEditorUi.selectedProp.colorGradeFilter === preset.filter ? 'is-selected' : ''}
                                onClick={() => updateSelectedPropEditorField('colorGradeFilter', preset.filter)}
                              >
                                {preset.label}
                              </button>
                            ))}
                            <button
                              type="button"
                              className="journey-prop-editor-color-reset"
                              onClick={() => updateSelectedPropEditorField('colorGradeFilter', '')}
                            >
                              Reset
                            </button>
                          </div>
                          <div className="journey-prop-editor-tint">
                            <span>Tint</span>
                            <input
                              type="color"
                              value={/^#([0-9a-f]{6})$/i.test(propEditorUi.selectedProp.tintColor || '') ? propEditorUi.selectedProp.tintColor : '#b88a4a'}
                              onChange={(event) => {
                                const color = event.target.value;
                                const strength = Number.isFinite(propEditorUi.selectedProp.tintStrength) && propEditorUi.selectedProp.tintStrength > 0
                                  ? propEditorUi.selectedProp.tintStrength : 0.4;
                                updateSelectedPropEditorTransform({ tintColor: color, tintStrength: strength, colorGradeFilter: buildJourneyTintGradeFilter(color, strength) });
                              }}
                              title="Pick a colour to tint this prop toward, then raise the strength"
                            />
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={propEditorUi.selectedProp.tintStrength ?? 0}
                              onChange={(event) => {
                                const strength = clamp(Number(event.target.value), 0, 1);
                                const color = /^#([0-9a-f]{6})$/i.test(propEditorUi.selectedProp.tintColor || '') ? propEditorUi.selectedProp.tintColor : '#b88a4a';
                                updateSelectedPropEditorTransform({ tintStrength: strength, tintColor: color, colorGradeFilter: buildJourneyTintGradeFilter(color, strength) });
                              }}
                            />
                            <output>{Math.round((propEditorUi.selectedProp.tintStrength ?? 0) * 100)}%</output>
                            <button
                              type="button"
                              className="journey-prop-editor-color-reset"
                              onClick={() => updateSelectedPropEditorTransform({ tintStrength: 0, colorGradeFilter: '' })}
                              title="Remove tint"
                            >
                              Clear
                            </button>
                          </div>
                          <div className="journey-prop-editor-tint">
                            <span title="Multiplies a solid colour onto the sprite — reaches true colours (clean blue, green, red) that the Tint above can't. Image props only; code-drawn props won't change.">Paint</span>
                            <input
                              type="color"
                              value={/^#([0-9a-f]{6})$/i.test(propEditorUi.selectedProp.paintColor || '') ? propEditorUi.selectedProp.paintColor : '#7c5a32'}
                              onChange={(event) => {
                                const color = event.target.value;
                                const strength = Number.isFinite(propEditorUi.selectedProp.paintStrength) && propEditorUi.selectedProp.paintStrength > 0
                                  ? propEditorUi.selectedProp.paintStrength : 0.6;
                                updateSelectedPropEditorTransform({ paintColor: color, paintStrength: strength });
                              }}
                              title="Pick the exact colour to paint this prop, then raise the strength"
                            />
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={propEditorUi.selectedProp.paintStrength ?? 0}
                              onChange={(event) => {
                                const strength = clamp(Number(event.target.value), 0, 1);
                                const color = /^#([0-9a-f]{6})$/i.test(propEditorUi.selectedProp.paintColor || '') ? propEditorUi.selectedProp.paintColor : '#7c5a32';
                                updateSelectedPropEditorTransform({ paintStrength: strength, paintColor: color });
                              }}
                            />
                            <output>{Math.round((propEditorUi.selectedProp.paintStrength ?? 0) * 100)}%</output>
                            <button
                              type="button"
                              className="journey-prop-editor-color-reset"
                              onClick={() => updateSelectedPropEditorTransform({ paintStrength: 0 })}
                              title="Remove paint colour"
                            >
                              Clear
                            </button>
                          </div>
                          <div className="journey-prop-editor-slider">
                            <span>Brightness</span>
                            <input
                              type="range"
                              min="0.4"
                              max="1.8"
                              step="0.05"
                              value={brightnessValue}
                              onChange={(event) => {
                                const next = clamp(Number(event.target.value), 0.4, 1.8);
                                if (Number.isFinite(next)) updateSelectedPropEditorNumberField('brightness', next, { min: 0.4, max: 1.8, decimals: 2 });
                              }}
                            />
                            <output>{brightnessValue.toFixed(2)}</output>
                          </div>
                          <div className="journey-prop-editor-slider">
                            <span>Warmth</span>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="1"
                              value={grade.sepia}
                              onChange={(event) => setGrade({ sepia: Number(event.target.value) })}
                            />
                            <output>{Math.round(grade.sepia)}%</output>
                          </div>
                          <div className="journey-prop-editor-slider">
                            <span>Saturation</span>
                            <input
                              type="range"
                              min="0"
                              max="200"
                              step="1"
                              value={grade.saturate}
                              onChange={(event) => setGrade({ saturate: Number(event.target.value) })}
                            />
                            <output>{Math.round(grade.saturate)}%</output>
                          </div>
                          <div className="journey-prop-editor-slider">
                            <span>Contrast</span>
                            <input
                              type="range"
                              min="50"
                              max="150"
                              step="1"
                              value={grade.contrast}
                              onChange={(event) => setGrade({ contrast: Number(event.target.value) })}
                            />
                            <output>{Math.round(grade.contrast)}%</output>
                          </div>
                          <div className="journey-prop-editor-slider">
                            <span>Hue shift</span>
                            <input
                              type="range"
                              min="-60"
                              max="60"
                              step="1"
                              value={grade.hue}
                              onChange={(event) => setGrade({ hue: Number(event.target.value) })}
                            />
                            <output>{Math.round(grade.hue)}°</output>
                          </div>
                          <div className="journey-prop-editor-slider">
                            <span>Alpha</span>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={propEditorUi.selectedProp.alpha ?? 1}
                              onChange={(event) => {
                                const next = clamp(Number(event.target.value), 0, 1);
                                if (Number.isFinite(next)) updateSelectedPropEditorNumberField('alpha', next, { min: 0, max: 1, decimals: 2 });
                              }}
                            />
                            <output>{Number(propEditorUi.selectedProp.alpha ?? 1).toFixed(2)}</output>
                          </div>
                          <label className="journey-prop-editor-color-advanced">
                            <span>Filter (advanced)</span>
                            <input
                              type="text"
                              value={propEditorUi.selectedProp.colorGradeFilter ?? ''}
                              placeholder="none"
                              onChange={(event) => updateSelectedPropEditorField('colorGradeFilter', event.target.value)}
                            />
                          </label>
                        </div>
                      );
                    })()}
                    </>
                    )}

                    {renderEditorSectionHeader('prop-shadows', 'Shadows & Sand')}
                    <div className="journey-prop-editor-controls" style={collapsedPanelSections['prop-shadows'] ? { display: 'none' } : undefined}>
                      <label>
                        <span>Shadow opacity</span>
                        <input
                          key={`${propEditorUi.selectedProp.id}-shadowOpacity`}
                          type="number"
                          min="0"
                          max="0.42"
                          step="0.01"
                          defaultValue={propEditorUi.selectedProp.shadowOpacity ?? ''}
                          onChange={(event) => {
                            const nextShadowOpacity = clamp(Number(event.target.value), 0, 0.42);
                            if (Number.isFinite(nextShadowOpacity)) updateSelectedPropEditorNumberField('shadowOpacity', nextShadowOpacity, { min: 0, max: 0.42, decimals: 2 });
                          }}
                        />
                      </label>
                      <label>
                        <span>Shadow width</span>
                        <input
                          key={`${propEditorUi.selectedProp.id}-shadowWidth`}
                          type="number"
                          min="0"
                          step="1"
                          defaultValue={propEditorUi.selectedProp.shadowWidth ?? ''}
                          onChange={(event) => {
                            const nextShadowWidth = Number(event.target.value);
                            if (Number.isFinite(nextShadowWidth)) updateSelectedPropEditorNumberField('shadowWidth', nextShadowWidth, { min: 0, round: true });
                          }}
                        />
                      </label>
                      <label>
                        <span>Shadow height</span>
                        <input
                          key={`${propEditorUi.selectedProp.id}-shadowHeight`}
                          type="number"
                          min="0"
                          step="1"
                          defaultValue={propEditorUi.selectedProp.shadowHeight ?? ''}
                          onChange={(event) => {
                            const nextShadowHeight = Number(event.target.value);
                            if (Number.isFinite(nextShadowHeight)) updateSelectedPropEditorNumberField('shadowHeight', nextShadowHeight, { min: 0, round: true });
                          }}
                        />
                      </label>
                      <label>
                        <span>Sand overlap</span>
                        <input
                          key={`${propEditorUi.selectedProp.id}-sandOverlapHeight`}
                          type="number"
                          min="0"
                          step="1"
                          defaultValue={propEditorUi.selectedProp.sandOverlapHeight ?? ''}
                          onChange={(event) => {
                            const nextSandOverlapHeight = Number(event.target.value);
                            if (Number.isFinite(nextSandOverlapHeight)) updateSelectedPropEditorNumberField('sandOverlapHeight', nextSandOverlapHeight, { min: 0, round: true });
                          }}
                        />
                      </label>
                      <label>
                        <span>Sand mound width</span>
                        <input
                          key={`${propEditorUi.selectedProp.id}-sandMoundWidth`}
                          type="number"
                          min="0"
                          step="1"
                          defaultValue={propEditorUi.selectedProp.sandMoundWidth ?? ''}
                          onChange={(event) => {
                            const nextSandMoundWidth = Number(event.target.value);
                            if (Number.isFinite(nextSandMoundWidth)) updateSelectedPropEditorNumberField('sandMoundWidth', nextSandMoundWidth, { min: 0, round: true });
                          }}
                        />
                      </label>
                      <label>
                        <span>Sand mound height</span>
                        <input
                          key={`${propEditorUi.selectedProp.id}-sandMoundHeight`}
                          type="number"
                          min="0"
                          step="1"
                          defaultValue={propEditorUi.selectedProp.sandMoundHeight ?? ''}
                          onChange={(event) => {
                            const nextSandMoundHeight = Number(event.target.value);
                            if (Number.isFinite(nextSandMoundHeight)) updateSelectedPropEditorNumberField('sandMoundHeight', nextSandMoundHeight, { min: 0, round: true });
                          }}
                        />
                      </label>
                      <label>
                        <span>Ground pebbles</span>
                        <input
                          key={`${propEditorUi.selectedProp.id}-groundPebbles`}
                          type="number"
                          min="0"
                          max="24"
                          step="1"
                          defaultValue={propEditorUi.selectedProp.groundPebbles ?? ''}
                          onChange={(event) => {
                            const nextGroundPebbles = clamp(Number(event.target.value), 0, 24);
                            if (Number.isFinite(nextGroundPebbles)) updateSelectedPropEditorNumberField('groundPebbles', nextGroundPebbles, { min: 0, round: true });
                          }}
                        />
                      </label>
                    </div>

                    <div className="journey-prop-editor-contact-controls">
                      <div className="journey-prop-editor-contact-header">
                        <span>Ground contact layers</span>
                        <button
                          type="button"
                          onClick={() => updateSelectedPropGroundContactLayer((propEditorUi.selectedProp.groundContactLayer || []).length)}
                        >
                          Add
                        </button>
                      </div>
                      {(propEditorUi.selectedProp.groundContactLayer || []).map((entry, index) => (
                        <div className="journey-prop-editor-contact-row" key={`${propEditorUi.selectedProp.id}-contact-${index}`}>
                          <strong>Contact {index + 1}</strong>
                          <label className="journey-prop-editor-contact-asset">
                            <span>Asset key</span>
                            <input
                              type="text"
                              value={entry.assetKey || ''}
                              onChange={(event) => updateSelectedPropGroundContactLayer(index, { assetKey: event.target.value })}
                            />
                          </label>
                          <label>
                            <span>Layer</span>
                            <select
                              value={entry.layer || 'overlay'}
                              onChange={(event) => updateSelectedPropGroundContactLayer(index, { layer: event.target.value })}
                            >
                              <option value="underlay">underlay</option>
                              <option value="overlay">overlay</option>
                            </select>
                          </label>
                          <label>
                            <span>X ratio</span>
                            <input
                              type="number"
                              min="0"
                              max="1"
                              step="0.01"
                              value={Number.isFinite(entry.xRatio) ? entry.xRatio : ''}
                              onChange={(event) => {
                                const nextXRatio = clamp(Number(event.target.value), 0, 1);
                                if (Number.isFinite(nextXRatio)) updateSelectedPropGroundContactLayer(index, { xRatio: Number(nextXRatio.toFixed(2)) });
                              }}
                            />
                          </label>
                          <label>
                            <span>Width ratio</span>
                            <input
                              type="number"
                              min="0"
                              max="1"
                              step="0.01"
                              value={Number.isFinite(entry.widthRatio) ? entry.widthRatio : ''}
                              onChange={(event) => {
                                const nextWidthRatio = clamp(Number(event.target.value), 0, 1);
                                if (Number.isFinite(nextWidthRatio)) updateSelectedPropGroundContactLayer(index, { widthRatio: Number(nextWidthRatio.toFixed(2)) });
                              }}
                            />
                          </label>
                          <label>
                            <span>Height</span>
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={Number.isFinite(entry.height) ? entry.height : ''}
                              onChange={(event) => {
                                const nextHeight = Number(event.target.value);
                                if (Number.isFinite(nextHeight)) updateSelectedPropGroundContactLayer(index, { height: Math.max(1, Math.round(nextHeight)) });
                              }}
                            />
                          </label>
                          <label>
                            <span>Y offset</span>
                            <input
                              type="number"
                              step="1"
                              value={Number.isFinite(entry.yOffset) ? entry.yOffset : ''}
                              onChange={(event) => {
                                const nextYOffset = Number(event.target.value);
                                if (Number.isFinite(nextYOffset)) updateSelectedPropGroundContactLayer(index, { yOffset: Math.round(nextYOffset) });
                              }}
                            />
                          </label>
                          <label>
                            <span>Rotation</span>
                            <input
                              type="number"
                              step="1"
                              value={Number.isFinite(entry.rotation) ? entry.rotation : 0}
                              onChange={(event) => {
                                const nextRotation = Number(event.target.value);
                                if (Number.isFinite(nextRotation)) updateSelectedPropGroundContactLayer(index, { rotation: Math.round(nextRotation) });
                              }}
                            />
                          </label>
                          <label>
                            <span>Alpha</span>
                            <input
                              type="number"
                              min="0"
                              max="1"
                              step="0.01"
                              value={Number.isFinite(entry.alpha) ? entry.alpha : ''}
                              onChange={(event) => {
                                const nextAlpha = clamp(Number(event.target.value), 0, 1);
                                if (Number.isFinite(nextAlpha)) updateSelectedPropGroundContactLayer(index, { alpha: Number(nextAlpha.toFixed(2)) });
                              }}
                            />
                          </label>
                          <label className="journey-prop-editor-checkbox">
                            <span>Mirror</span>
                            <input
                              type="checkbox"
                              checked={entry.mirrorX === true}
                              onChange={(event) => updateSelectedPropGroundContactLayer(index, { mirrorX: event.target.checked })}
                            />
                          </label>
                          <label className="journey-prop-editor-contact-filter">
                            <span>Filter</span>
                            <input
                              type="text"
                              value={entry.filter || ''}
                              onChange={(event) => updateSelectedPropGroundContactLayer(index, { filter: event.target.value })}
                            />
                          </label>
                          <button
                            type="button"
                            className="journey-prop-editor-contact-remove"
                            onClick={() => removeSelectedPropGroundContactLayer(index)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {propEditorUi.selectedPlatform && (
                  <div className="journey-prop-editor-controls">
                    <label>
                      <span>X</span>
                      <input
                        type="number"
                        step="1"
                        value={propEditorUi.selectedPlatform.x}
                        onChange={(event) => {
                          const nextX = Number(event.target.value);
                          if (Number.isFinite(nextX)) updateSelectedPlatformEditorTransform({ x: Math.round(nextX) });
                        }}
                      />
                    </label>
                    <label>
                      <span>Y</span>
                      <input
                        type="number"
                        step="1"
                        value={propEditorUi.selectedPlatform.y}
                        onChange={(event) => {
                          const nextY = Number(event.target.value);
                          if (Number.isFinite(nextY)) updateSelectedPlatformEditorTransform({ y: Math.round(nextY) });
                        }}
                      />
                    </label>
                    <label>
                      <span>Width</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={propEditorUi.selectedPlatform.width}
                        onChange={(event) => {
                          const nextWidth = Number(event.target.value);
                          if (Number.isFinite(nextWidth)) updateSelectedPlatformEditorTransform({ width: Math.max(1, Math.round(nextWidth)) });
                        }}
                      />
                    </label>
                    <label>
                      <span>Height</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={propEditorUi.selectedPlatform.height}
                        onChange={(event) => {
                          const nextHeight = Number(event.target.value);
                          if (Number.isFinite(nextHeight)) updateSelectedPlatformEditorTransform({ height: Math.max(1, Math.round(nextHeight)) });
                        }}
                      />
                    </label>
                    <label>
                      <span>Layer</span>
                      <input
                        type="text"
                        value={propEditorUi.selectedPlatform.layer}
                        onChange={(event) => updateSelectedPlatformEditorTransform({ layer: event.target.value })}
                      />
                    </label>
                    <label>
                      <span>Collision</span>
                      <select
                        value={propEditorUi.selectedPlatform.collision}
                        onChange={(event) => updateSelectedPlatformEditorTransform({
                          collision: event.target.value === 'blocker' ? 'blocker' : 'landing',
                          layer: event.target.value === 'blocker' ? 'blocker' : propEditorUi.selectedPlatform.layer,
                        })}
                      >
                        <option value="landing">Landing</option>
                        <option value="blocker">Blocker</option>
                      </select>
                    </label>
                    {propEditorUi.selectedPlatform.collision === 'blocker' && (
                      <label>
                        <span>Shape</span>
                        <select
                          value={propEditorUi.selectedPlatform.blockerShape}
                          onChange={(event) => updateSelectedPlatformEditorTransform({
                            blockerShape: event.target.value === 'left-slant' || event.target.value === 'right-slant'
                              ? event.target.value
                              : 'box',
                          })}
                        >
                          <option value="box">Box</option>
                          <option value="left-slant">Left slant</option>
                          <option value="right-slant">Right slant</option>
                        </select>
                      </label>
                    )}
                    <label>
                      <span>Z-index</span>
                      <input
                        type="number"
                        step="1"
                        placeholder="auto"
                        value={Number.isFinite(Number(propEditorUi.selectedPlatform.zIndex)) ? propEditorUi.selectedPlatform.zIndex : ''}
                        onChange={(event) => {
                          const nextZIndex = Number(event.target.value);
                          if (Number.isFinite(nextZIndex)) updateSelectedPlatformEditorTransform({ zIndex: Math.round(nextZIndex) });
                        }}
                      />
                    </label>
                  </div>
                )}
                {propEditorUi.selectedHazard && (
                  <div className="journey-prop-editor-controls">
                    <label>
                      <span>Type</span>
                      <select
                        value={JOURNEY_TRAP_TYPES[propEditorUi.selectedHazard.type] ? propEditorUi.selectedHazard.type : ''}
                        onChange={(event) => {
                          if (event.target.value) updateSelectedHazardEditorTransform({ type: event.target.value });
                        }}
                      >
                        <option value="">Legacy hazard</option>
                        {Object.entries(JOURNEY_TRAP_TYPES).map(([type, config]) => (
                          <option key={type} value={type}>{config.label}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>X</span>
                      <input
                        type="number"
                        step="1"
                        value={propEditorUi.selectedHazard.x}
                        onChange={(event) => {
                          const nextX = Number(event.target.value);
                          if (Number.isFinite(nextX)) updateSelectedHazardEditorTransform({ x: Math.round(nextX) });
                        }}
                      />
                    </label>
                    <label>
                      <span>Y</span>
                      <input
                        type="number"
                        step="1"
                        value={propEditorUi.selectedHazard.y}
                        onChange={(event) => {
                          const nextY = Number(event.target.value);
                          if (Number.isFinite(nextY)) updateSelectedHazardEditorTransform({ y: Math.round(nextY) });
                        }}
                      />
                    </label>
                    <label>
                      <span>Width</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={propEditorUi.selectedHazard.width}
                        onChange={(event) => {
                          const nextWidth = Number(event.target.value);
                          if (Number.isFinite(nextWidth)) updateSelectedHazardEditorTransform({ width: Math.max(1, Math.round(nextWidth)) });
                        }}
                      />
                    </label>
                    <label>
                      <span>Height</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={propEditorUi.selectedHazard.height}
                        onChange={(event) => {
                          const nextHeight = Number(event.target.value);
                          if (Number.isFinite(nextHeight)) {
                            const height = Math.max(1, Math.round(nextHeight));
                            updateSelectedHazardEditorTransform({
                              height,
                              y: propEditorUi.selectedHazard.y + propEditorUi.selectedHazard.height - height,
                            });
                          }
                        }}
                      />
                    </label>
                    <label>
                      <span>Burial</span>
                      <input
                        type="number"
                        min="0"
                        max="0.85"
                        step="0.05"
                        value={Number((propEditorUi.selectedHazard.burial || 0).toFixed(2))}
                        onChange={(event) => {
                          const nextBurial = clamp(Number(event.target.value), 0, 0.85);
                          if (Number.isFinite(nextBurial)) updateSelectedHazardEditorTransform({ burial: Number(nextBurial.toFixed(2)) });
                        }}
                      />
                    </label>
                    <label>
                      <span>Brightness</span>
                      <input
                        type="number"
                        min="0.4"
                        max="1.8"
                        step="0.05"
                        defaultValue={Number((propEditorUi.selectedHazard.brightness ?? 1).toFixed(2))}
                        onChange={(event) => {
                          const nextBrightness = clamp(Number(event.target.value), 0.4, 1.8);
                          if (Number.isFinite(nextBrightness)) updateSelectedHazardEditorTransform({ brightness: Number(nextBrightness.toFixed(2)) });
                        }}
                      />
                    </label>
                    <label>
                      <span>Alpha</span>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.05"
                        defaultValue={Number((propEditorUi.selectedHazard.alpha ?? 1).toFixed(2))}
                        onChange={(event) => {
                          const nextAlpha = clamp(Number(event.target.value), 0, 1);
                          if (Number.isFinite(nextAlpha)) updateSelectedHazardEditorTransform({ alpha: Number(nextAlpha.toFixed(2)) });
                        }}
                      />
                    </label>
                    <label>
                      <span>Colour grade</span>
                      <input
                        type="text"
                        defaultValue={propEditorUi.selectedHazard.colorGradeFilter || ''}
                        onChange={(event) => updateSelectedHazardEditorTransform({ colorGradeFilter: event.target.value })}
                      />
                    </label>
                    <label>
                      <span>Trigger X</span>
                      <input
                        type="number"
                        step="1"
                        value={propEditorUi.selectedHazard.triggerOffset.x}
                        onChange={(event) => {
                          const nextX = Number(event.target.value);
                          if (Number.isFinite(nextX)) {
                            updateSelectedHazardEditorTransform({
                              triggerArea: {
                                ...propEditorUi.selectedHazard.triggerOffset,
                                x: Math.round(nextX),
                              },
                            });
                          }
                        }}
                      />
                    </label>
                    <label>
                      <span>Trigger Y</span>
                      <input
                        type="number"
                        step="1"
                        value={propEditorUi.selectedHazard.triggerOffset.y}
                        onChange={(event) => {
                          const nextY = Number(event.target.value);
                          if (Number.isFinite(nextY)) {
                            updateSelectedHazardEditorTransform({
                              triggerArea: {
                                ...propEditorUi.selectedHazard.triggerOffset,
                                y: Math.round(nextY),
                              },
                            });
                          }
                        }}
                      />
                    </label>
                    <label>
                      <span>Trigger W</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={propEditorUi.selectedHazard.triggerOffset.width}
                        onChange={(event) => {
                          const width = Math.max(1, Math.round(Number(event.target.value)));
                          if (Number.isFinite(width)) {
                            updateSelectedHazardEditorTransform({
                              triggerArea: {
                                ...propEditorUi.selectedHazard.triggerOffset,
                                width,
                              },
                            });
                          }
                        }}
                      />
                    </label>
                    <label>
                      <span>Trigger H</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={propEditorUi.selectedHazard.triggerOffset.height}
                        onChange={(event) => {
                          const height = Math.max(1, Math.round(Number(event.target.value)));
                          if (Number.isFinite(height)) {
                            updateSelectedHazardEditorTransform({
                              triggerArea: {
                                ...propEditorUi.selectedHazard.triggerOffset,
                                height,
                              },
                            });
                          }
                        }}
                      />
                    </label>
                    <label>
                      <span>Damage</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={propEditorUi.selectedHazard.damage}
                        onChange={(event) => {
                          const damage = Math.max(0, Math.round(Number(event.target.value)));
                          if (Number.isFinite(damage)) updateSelectedHazardEditorTransform({ damage });
                        }}
                      />
                    </label>
                    <label>
                      <span>Cooldown</span>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={propEditorUi.selectedHazard.cooldown}
                        onChange={(event) => {
                          const cooldown = Math.max(0, Number(event.target.value));
                          if (Number.isFinite(cooldown)) updateSelectedHazardEditorTransform({ cooldown: Number(cooldown.toFixed(2)) });
                        }}
                      />
                    </label>
                    <label>
                      <span>Depth</span>
                      <select
                        value={propEditorUi.selectedHazard.depth}
                        onChange={(event) => updateSelectedHazardEditorTransform({ depth: event.target.value })}
                      >
                        {PROP_EDITOR_DEPTH_OPTIONS.map(depth => (
                          <option key={depth} value={depth}>{depth}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Reset</span>
                      <select
                        value={propEditorUi.selectedHazard.reset ? 'true' : 'false'}
                        onChange={(event) => updateSelectedHazardEditorTransform({ reset: event.target.value === 'true' })}
                      >
                        <option value="false">No reset</option>
                        <option value="true">Reset</option>
                      </select>
                    </label>
                    <label>
                      <span>Editor</span>
                      <select
                        value={propEditorUi.selectedHazard.editorVisible ? 'show' : 'hide'}
                        onChange={(event) => updateSelectedHazardEditorTransform({ editorVisible: event.target.value === 'show' })}
                      >
                        <option value="show">Visible</option>
                        <option value="hide">Hidden</option>
                      </select>
                    </label>
                    <label>
                      <span>Linked IDs</span>
                      <input
                        type="text"
                        value={propEditorUi.selectedHazard.linkedObjectIds}
                        onChange={(event) => updateSelectedHazardEditorTransform({
                          linkedObjectIds: event.target.value.split(',').map(item => item.trim()).filter(Boolean),
                        })}
                      />
                    </label>
                    {propEditorUi.selectedHazard.type === 'dart-launcher' && (
                      <>
                        <label>
                          <span>Direction</span>
                          <select
                            value={propEditorUi.selectedHazard.direction}
                            onChange={(event) => updateSelectedHazardEditorTransform({ direction: event.target.value })}
                          >
                            {JOURNEY_TRAP_DIRECTIONS.map(direction => (
                              <option key={direction} value={direction}>{direction}</option>
                            ))}
                          </select>
                        </label>
                        <label>
                          <span>Launcher X</span>
                          <input
                            type="number"
                            step="1"
                            value={propEditorUi.selectedHazard.launcherX}
                            onChange={(event) => {
                              const launcherX = Math.round(Number(event.target.value));
                              if (Number.isFinite(launcherX)) updateSelectedHazardEditorTransform({ launcherX });
                            }}
                          />
                        </label>
                        <label>
                          <span>Launcher Y</span>
                          <input
                            type="number"
                            step="1"
                            value={propEditorUi.selectedHazard.launcherY}
                            onChange={(event) => {
                              const launcherY = Math.round(Number(event.target.value));
                              if (Number.isFinite(launcherY)) updateSelectedHazardEditorTransform({ launcherY });
                            }}
                          />
                        </label>
                      </>
                    )}
                  </div>
                )}
                {propEditorUi.selectedArch && (
                  <div className="journey-prop-editor-controls">
                    <label>
                      <span>X</span>
                      <input
                        type="number"
                        step="1"
                        value={propEditorUi.selectedArch.x}
                        onChange={(event) => {
                          const nextX = Number(event.target.value);
                          if (Number.isFinite(nextX)) updateSelectedArchEditorTransform({ x: Math.round(nextX) });
                        }}
                      />
                    </label>
                    <label>
                      <span>Y</span>
                      <input
                        type="number"
                        step="1"
                        value={propEditorUi.selectedArch.y}
                        onChange={(event) => {
                          const nextY = Number(event.target.value);
                          if (Number.isFinite(nextY)) updateSelectedArchEditorTransform({ y: Math.round(nextY) });
                        }}
                      />
                    </label>
                    <label>
                      <span>Width</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={propEditorUi.selectedArch.width}
                        onChange={(event) => {
                          const nextWidth = Number(event.target.value);
                          if (Number.isFinite(nextWidth)) updateSelectedArchEditorTransform({ width: Math.max(1, Math.round(nextWidth)) });
                        }}
                      />
                    </label>
                    <label>
                      <span>Height</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={propEditorUi.selectedArch.height}
                        onChange={(event) => {
                          const nextHeight = Number(event.target.value);
                          if (Number.isFinite(nextHeight)) updateSelectedArchEditorTransform({ height: Math.max(1, Math.round(nextHeight)) });
                        }}
                      />
                    </label>
                  </div>
                )}
                {propEditorUi.selectedLair && (
                  <>
                    {renderEditorSectionHeader('lair-box', 'Lair box')}
                    <div className="journey-prop-editor-controls" style={collapsedPanelSections['lair-box'] ? { display: 'none' } : undefined}>
                      <label>
                        <span>Lair X</span>
                        <input
                          type="number"
                          step="1"
                          value={propEditorUi.selectedLair.x}
                          onChange={(event) => {
                            const next = Number(event.target.value);
                            if (Number.isFinite(next)) updateSelectedLairEditorTransform({ lairX: Math.round(next) });
                          }}
                        />
                      </label>
                      <label>
                        <span>Lair Y</span>
                        <input
                          type="number"
                          step="1"
                          value={propEditorUi.selectedLair.y}
                          onChange={(event) => {
                            const next = Number(event.target.value);
                            if (Number.isFinite(next)) updateSelectedLairEditorTransform({ lairY: Math.round(next) });
                          }}
                        />
                      </label>
                      <label>
                        <span>Lair W</span>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={propEditorUi.selectedLair.width}
                          onChange={(event) => {
                            const next = Number(event.target.value);
                            if (Number.isFinite(next)) updateSelectedLairEditorTransform({ lairWidth: Math.max(1, Math.round(next)) });
                          }}
                        />
                      </label>
                      <label>
                        <span>Lair H</span>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={propEditorUi.selectedLair.height}
                          onChange={(event) => {
                            const next = Number(event.target.value);
                            if (Number.isFinite(next)) updateSelectedLairEditorTransform({ lairHeight: Math.max(1, Math.round(next)) });
                          }}
                        />
                      </label>
                    </div>

                    {renderEditorSectionHeader('lair-boss', 'Boss')}
                    <div className="journey-prop-editor-controls" style={collapsedPanelSections['lair-boss'] ? { display: 'none' } : undefined}>
                      <label>
                        <span>Boss X</span>
                        <input
                          type="number"
                          step="1"
                          value={propEditorUi.selectedLair.bossX}
                          onChange={(event) => {
                            const next = Number(event.target.value);
                            if (Number.isFinite(next)) updateSelectedLairEditorTransform({ x: Math.round(next) });
                          }}
                        />
                      </label>
                      <label>
                        <span>Boss Y</span>
                        <input
                          type="number"
                          step="1"
                          value={propEditorUi.selectedLair.bossY}
                          onChange={(event) => {
                            const next = Number(event.target.value);
                            if (Number.isFinite(next)) updateSelectedLairEditorTransform({ y: Math.round(next) });
                          }}
                        />
                      </label>
                      <label>
                        <span>Boss W</span>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={propEditorUi.selectedLair.bossWidth}
                          onChange={(event) => {
                            const next = Number(event.target.value);
                            if (Number.isFinite(next)) updateSelectedLairEditorTransform({ width: Math.max(1, Math.round(next)) });
                          }}
                        />
                      </label>
                      <label>
                        <span>Boss H</span>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={propEditorUi.selectedLair.bossHeight}
                          onChange={(event) => {
                            const next = Number(event.target.value);
                            if (Number.isFinite(next)) updateSelectedLairEditorTransform({ height: Math.max(1, Math.round(next)) });
                          }}
                        />
                      </label>
                    </div>

                    {renderEditorSectionHeader('lair-arena', 'Arena & Patrol')}
                    <div className="journey-prop-editor-controls" style={collapsedPanelSections['lair-arena'] ? { display: 'none' } : undefined}>
                      <label>
                        <span>Arena Start</span>
                        <input
                          type="number"
                          step="1"
                          value={propEditorUi.selectedLair.arenaStart}
                          onChange={(event) => {
                            const next = Number(event.target.value);
                            if (Number.isFinite(next)) updateSelectedLairEditorTransform({ arenaStart: Math.round(next) });
                          }}
                        />
                      </label>
                      <label>
                        <span>Arena End</span>
                        <input
                          type="number"
                          step="1"
                          value={propEditorUi.selectedLair.arenaEnd}
                          onChange={(event) => {
                            const next = Number(event.target.value);
                            if (Number.isFinite(next)) updateSelectedLairEditorTransform({ arenaEnd: Math.round(next) });
                          }}
                        />
                      </label>
                      <label>
                        <span>Patrol Min</span>
                        <input
                          type="number"
                          step="1"
                          placeholder="auto"
                          value={propEditorUi.selectedLair.patrolMin}
                          onChange={(event) => {
                            const next = Number(event.target.value);
                            if (Number.isFinite(next)) updateSelectedLairEditorTransform({ patrolMin: Math.round(next) });
                          }}
                        />
                      </label>
                      <label>
                        <span>Patrol Max</span>
                        <input
                          type="number"
                          step="1"
                          placeholder="auto"
                          value={propEditorUi.selectedLair.patrolMax}
                          onChange={(event) => {
                            const next = Number(event.target.value);
                            if (Number.isFinite(next)) updateSelectedLairEditorTransform({ patrolMax: Math.round(next) });
                          }}
                        />
                      </label>
                    </div>
                  </>
                )}
                {propEditorUi.selectedCheckpoint && (
                  <div className="journey-prop-editor-controls">
                    <label>
                      <span>X</span>
                      <input
                        type="number"
                        step="1"
                        value={propEditorUi.selectedCheckpoint.x}
                        onChange={(event) => {
                          const nextX = Number(event.target.value);
                          if (Number.isFinite(nextX)) updateSelectedCheckpointEditorTransform({ x: Math.round(nextX) });
                        }}
                      />
                    </label>
                    <label>
                      <span>Y</span>
                      <input
                        type="number"
                        step="1"
                        value={propEditorUi.selectedCheckpoint.y}
                        onChange={(event) => {
                          const nextY = Number(event.target.value);
                          if (Number.isFinite(nextY)) updateSelectedCheckpointEditorTransform({ y: Math.round(nextY) });
                        }}
                      />
                    </label>
                  </div>
                )}
                {propEditorUi.selectedNest && (
                  <>
                    {renderEditorSectionHeader('nest-placement', 'Nest placement')}
                    <div className="journey-prop-editor-controls" style={collapsedPanelSections['nest-placement'] ? { display: 'none' } : undefined}>
                      <label>
                        <span>X</span>
                        <input
                          type="number"
                          step="1"
                          value={propEditorUi.selectedNest.x}
                          onChange={(event) => {
                            const next = Number(event.target.value);
                            if (Number.isFinite(next)) updateSelectedNestEditorTransform({ x: Math.round(next) });
                          }}
                        />
                      </label>
                      <label>
                        <span>Y</span>
                        <input
                          type="number"
                          step="1"
                          value={propEditorUi.selectedNest.y}
                          onChange={(event) => {
                            const next = Number(event.target.value);
                            if (Number.isFinite(next)) updateSelectedNestEditorTransform({ y: Math.round(next) });
                          }}
                        />
                      </label>
                      <label>
                        <span>Size</span>
                        <input
                          type="number"
                          min="0.3"
                          step="0.05"
                          value={propEditorUi.selectedNest.widthScale}
                          onChange={(event) => {
                            const next = Number(event.target.value);
                            if (Number.isFinite(next)) updateSelectedNestEditorTransform({ widthScale: Math.max(0.3, Number(next.toFixed(2))) });
                          }}
                        />
                      </label>
                      <label>
                        <span>Anchor</span>
                        <input
                          type="number"
                          step="1"
                          value={propEditorUi.selectedNest.yOffset}
                          onChange={(event) => {
                            const next = Number(event.target.value);
                            if (Number.isFinite(next)) updateSelectedNestEditorTransform({ yOffset: Math.round(next) });
                          }}
                        />
                      </label>
                    </div>

                    {renderEditorSectionHeader('nest-glow', 'Nest glow')}
                    <div className="journey-prop-editor-controls" style={collapsedPanelSections['nest-glow'] ? { display: 'none' } : undefined}>
                      <label>
                        <span>Glow Y</span>
                        <input
                          type="number"
                          step="0.02"
                          value={propEditorUi.selectedNest.glowYFactor}
                          onChange={(event) => {
                            const next = Number(event.target.value);
                            if (Number.isFinite(next)) updateSelectedNestEditorTransform({ glowYFactor: Number(next.toFixed(2)) });
                          }}
                        />
                      </label>
                      <label>
                        <span>Glow Size</span>
                        <input
                          type="number"
                          min="0.1"
                          step="0.05"
                          value={propEditorUi.selectedNest.glowSize}
                          onChange={(event) => {
                            const next = Number(event.target.value);
                            if (Number.isFinite(next)) updateSelectedNestEditorTransform({ glowSize: Math.max(0.1, Number(next.toFixed(2))) });
                          }}
                        />
                      </label>
                    </div>
                    <div className="journey-prop-editor-controls">
                      <button type="button" onClick={resetSelectedNestEditor}>
                        Reset nest
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {import.meta.env.DEV && propEditorUi.enabled && propEditorUi.paletteOpen && (() => {
              const paletteTitles = PROP_EDITOR_PALETTE_TITLES;
              const paletteSearching = Boolean(String(propEditorUi.paletteSearch || '').trim());
              const filteredPalette = filterJourneyPaletteBySearch(propEditorUi.palette, propEditorUi.paletteSearch);
              const armedPaletteItem = propEditorUi.selectedPaletteKey
                ? propEditorUi.palette.find(item => item.key === propEditorUi.selectedPaletteKey)
                : null;
              const armedPaletteAssetKey = armedPaletteItem
                ? armedPaletteItem.preview?.assetKey || armedPaletteItem.atmosphereAssetKey || armedPaletteItem.imageAssetKey || armedPaletteItem.type
                : null;
              return (
              <div className={`journey-prop-palette-panel ${propEditorUi.paletteDockLayout === 'sidebar' ? 'is-sidebar-layout' : ''}`} aria-label="Prop palette">
                <div className="journey-prop-editor-export-header">
                  <strong>{paletteTitles[propEditorUi.selectedPaletteCategory] || 'Prop palette'}</strong>
                  <input
                    type="search"
                    className="journey-prop-palette-search"
                    placeholder="Search palette..."
                    title="Type to filter. Enter arms the first match. Esc clears the search, then closes the palette."
                    value={propEditorUi.paletteSearch}
                    autoFocus
                    onChange={handlePaletteSearchChange}
                    onKeyDown={handlePaletteSearchKeyDown}
                  />
                  <span>{paletteSearching ? `${filteredPalette.length} of ${propEditorUi.palette.length}` : `${propEditorUi.palette.length} items`}</span>
                  <button
                    type="button"
                    className="journey-prop-palette-layout-toggle"
                    title={propEditorUi.paletteDockLayout === 'sidebar'
                      ? 'Switch to compact bottom tray'
                      : 'Switch to readable side browser'}
                    onClick={() => {
                      const ed = propPlacementEditorRef.current;
                      ed.paletteDockLayout = propEditorUi.paletteDockLayout === 'sidebar' ? 'tray' : 'sidebar';
                      try {
                        window.localStorage.setItem(JOURNEY_PROP_PALETTE_DOCK_KEY, ed.paletteDockLayout);
                      } catch {
                        /* ignore palette layout persistence errors */
                      }
                      refreshPropEditorUi();
                    }}
                  >
                    {propEditorUi.paletteDockLayout === 'sidebar' ? 'Sidebar' : 'Tray'}
                  </button>
                  <button
                    type="button"
                    className={`journey-prop-palette-stamp${propEditorUi.stampMode ? ' is-selected' : ''}`}
                    title="Stamp mode: keep the palette open and the selected item armed after placing."
                    onClick={() => {
                      const ed = propPlacementEditorRef.current;
                      ed.stampMode = !ed.stampMode;
                      if (!ed.stampMode) ed.selectedPaletteKey = null;
                      refreshPropEditorUi();
                    }}
                  >
                    {propEditorUi.stampMode ? 'Stamp on' : 'Stamp off'}
                  </button>
                  <button
                    type="button"
                    title="Close palette (P or Esc)"
                    onClick={() => {
                      const ed = propPlacementEditorRef.current;
                      ed.paletteOpen = false;
                      ed.selectedPaletteKey = null;
                      refreshPropEditorUi();
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div className="journey-prop-palette-browser">
                  <div className="journey-prop-palette-main">
                    <div className="journey-prop-palette-category-rail" aria-label="Palette categories">
                      <span className="journey-prop-palette-recent-label">Categories</span>
                <div className="journey-prop-palette-tabs">
                  {[
                    ['arch-prop', 'Architecture'],
                    ['env-prop', 'Atmosphere'],
                    ['bridge-floor-prop', 'Bridges & Floors'],
                    ['sacred-prop', 'Camp & Sacred'],
                    ['ledge', 'Ledges'],
                    ['ground-detail', 'Ground Details'],
                    ['foreground-detail', 'Foreground Details'],
                    ['shard-prop', 'Shards'],
                    ['platform', 'Platforms'],
                    ['trap', 'Traps'],
                  ].map(([category, label]) => (
                    <button
                      key={category}
                      type="button"
                      className={propEditorUi.selectedPaletteCategory === category ? 'is-selected' : ''}
                      onClick={() => {
                        propPlacementEditorRef.current.selectedPaletteCategory = category;
                        propPlacementEditorRef.current.selectedPaletteKey = null;
                        refreshPropEditorUi();
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                    </div>
                {propEditorUi.recentPaletteItems?.length > 0 && (
                  <div className="journey-prop-palette-recent">
                    <span className="journey-prop-palette-recent-label">Recent</span>
                    {propEditorUi.recentPaletteItems.map(item => {
                      const isArmed = propEditorUi.selectedPaletteKey === item.key;
                      return (
                        <button
                          key={`recent-${item.category}-${item.key}`}
                          type="button"
                          className={`journey-prop-palette-recent-item${isArmed ? ' is-selected' : ''}`}
                          title={isArmed ? `${item.label} — click again to disarm` : `${item.label} — click to place again`}
                          onClick={() => {
                            const ed = propPlacementEditorRef.current;
                            if (isArmed) {
                              ed.selectedPaletteKey = null;
                            } else {
                              ed.selectedPaletteCategory = item.category;
                              ed.selectedPaletteKey = item.key;
                            }
                            refreshPropEditorUi();
                          }}
                        >
                          <span className="journey-prop-palette-thumb" aria-hidden="true">
                            <span style={item.preview.style} />
                          </span>
                          <span className="journey-prop-palette-recent-name">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                <div className="journey-prop-palette-list journey-prop-palette-grid">
                  {filteredPalette.length === 0 && (
                    <div className="journey-prop-palette-empty">
                      <span>No matches for “{String(propEditorUi.paletteSearch || '').trim()}”</span>
                      <button
                        type="button"
                        onClick={() => {
                          propPlacementEditorRef.current.paletteSearch = '';
                          refreshPropEditorUi();
                        }}
                      >
                        Clear search
                      </button>
                    </div>
                  )}
                  {Object.entries(filteredPalette.reduce((acc, item) => {
                    const group = item.category || 'General';
                    if (!acc[group]) acc[group] = [];
                    acc[group].push(item);
                    return acc;
                  }, {})).map(([groupName, items]) => {
                    // While searching, force every group open so matches are never hidden
                    // behind a collapsed header.
                    const isCollapsed = !paletteSearching && (propEditorUi.collapsedPaletteGroups?.[groupName] || false);
                    return (
                    <div key={groupName} className="journey-prop-palette-group">
                      <button
                        type="button"
                        className="journey-prop-palette-group-toggle"
                        disabled={paletteSearching}
                        onClick={() => {
                          if (!propPlacementEditorRef.current.collapsedPaletteGroups) {
                            propPlacementEditorRef.current.collapsedPaletteGroups = {};
                          }
                          propPlacementEditorRef.current.collapsedPaletteGroups[groupName] = !isCollapsed;
                          refreshPropEditorUi();
                        }}
                      >
                        <span aria-hidden="true">{isCollapsed ? '▶' : '▼'}</span>
                        <strong>{groupName}</strong>
                        <em>{items.length}</em>
                      </button>
                      {!isCollapsed && items.map(item => {
                        const isArmed = propEditorUi.selectedPaletteKey === item.key;
                        return (
                          <button
                            key={item.key}
                            type="button"
                            className={isArmed ? 'is-selected' : ''}
                            title={isArmed ? `${item.label} — click again to disarm` : `${item.label} — click to arm, then click in the world to place`}
                            onClick={() => {
                              propPlacementEditorRef.current.selectedPaletteKey = isArmed ? null : item.key;
                              refreshPropEditorUi();
                            }}
                          >
                            <span className="journey-prop-palette-thumb" aria-hidden="true">
                              <span style={item.preview.style} />
                            </span>
                            <span className="journey-prop-palette-copy">
                              <strong>{item.label}</strong>
                              <span>{item.preview.assetKey || item.atmosphereAssetKey || item.type}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  );})}
                </div>
                  </div>
                </div>
                {armedPaletteItem && (
                  <div className="journey-prop-palette-details-box journey-prop-palette-selection-tray">
                    <div className="journey-prop-palette-details-row">
                      <span className="journey-prop-palette-details-title">
                        <strong>{armedPaletteItem.label}</strong>
                        <em className="journey-prop-palette-details-category">{armedPaletteItem.category || 'General'}</em>
                      </span>
                      <span>{propEditorUi.stampMode ? 'Stamp mode' : 'Single place'}</span>
                    </div>
                    <div className="journey-prop-palette-details-meta">
                      <span>Type <code>{armedPaletteItem.type}</code></span>
                      {armedPaletteAssetKey && <span>Asset <code>{armedPaletteAssetKey}</code></span>}
                    </div>
                    <div className="journey-prop-palette-details-hint">
                      Click in the world to place. Esc cancels{propEditorUi.stampMode ? '; stamp mode keeps this prop armed.' : '.'}
                    </div>
                  </div>
                )}
              </div>
              );
            })()}

            {import.meta.env.DEV && propEditorUi.exportVisible && (
              <div className="journey-prop-editor-export">
                <div className="journey-prop-editor-export-header">
                  <strong>Placement export</strong>
                  {propEditorUi.savedAt && <span>{propEditorUi.savedAt}</span>}
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Discard all unsaved editor edits (moves, additions, deletions) for every room? This cannot be undone.')) {
                        clearSavedPropEditorState();
                      }
                    }}
                  >
                    Clear saved
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      propPlacementEditorRef.current.exportVisible = false;
                      refreshPropEditorUi();
                    }}
                  >
                    Close
                  </button>
                </div>
                <div className="journey-prop-editor-export-subhead">
                  <strong>AI instructions (paste into AI)</strong>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(propEditorUi.aiInstructions || '');
                    }}
                  >
                    Copy
                  </button>
                </div>
                <textarea readOnly value={propEditorUi.aiInstructions} aria-label="AI change instructions" />
                <div className="journey-prop-editor-export-subhead">
                  <strong>Export JSON (for apply script)</strong>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(propEditorUi.exportText || '');
                    }}
                  >
                    Copy
                  </button>
                </div>
                <textarea readOnly value={propEditorUi.exportText} aria-label="Placement editor export JSON" />
              </div>
            )}
    </>
  );
}
