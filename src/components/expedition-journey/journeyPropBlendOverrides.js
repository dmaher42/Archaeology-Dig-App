// Prop blend polish layer — now EMPTY by design.
// The desert-entry cluster props that used to be pinned here have been "unpinned" so the
// Journey editor export (journeyPlacementOverrides.generated.js) is the single source of
// truth for their position/color-grade/grounding. Re-add an entry here only if you need a
// hand-authored override that must win over an editor export AND survive future re-exports.
const journeyPropBlendOverrides = {
  room: 'desert-entry',
  props: [],
  deletedPropIds: [],
  platforms: [],
  deletedPlatformIds: [],
  hazards: [],
  deletedHazardIds: [],
  routeGates: [],
  routeGateDoorways: [],
  checkpoints: [],
  miniBosses: [],
};

export default journeyPropBlendOverrides;
