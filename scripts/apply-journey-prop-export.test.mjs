import assert from 'node:assert/strict';
import test from 'node:test';
import { applyJourneyPropExportToSource } from './apply-journey-prop-export.mjs';

test('applyJourneyPropExportToSource updates existing props, removes deleted props, and appends new props', () => {
  const source = `const X = value => value;
export const MINI_BOSSES = [
  { id: 'scarab-queen', name: 'Scarab Queen', x: 2150, y: 330, width: 92, height: 96, arenaStart: 2020, arenaEnd: 2235, intro: 'old lair' },
  { id: 'looter-captain', name: 'Bes', x: 4600, y: 320, width: 86, height: 112, arenaStart: 4470, arenaEnd: 4730 },
];
export const PLATFORMS = [
  { id: 'ledge-a', sectionId: 'desert-entry', x: 320, y: 440, width: 120, height: 18, label: 'old ledge' },
  { id: 'ledge-b', sectionId: 'desert-entry', x: 520, y: 390, width: 96, height: 18, label: 'keep ledge' },
];
export const HAZARDS = [
  { id: 'trap-a', name: 'pressure plate', x: 735, y: 326, width: 126, height: 34, penalty: { stamina: 8 }, message: 'old trap' },
  { id: 'trap-b', name: 'soft sand', x: 1060, y: 328, width: 132, height: 32, penalty: { time: 9 }, message: 'keep trap' },
];
export const STORY_PROPS = [
  { id: 'tablet-a', sectionId: 'desert-entry', type: 'camp', x: 100, y: 200, label: 'old camp' },
  { id: 'tablet-b', sectionId: 'desert-entry', type: 'statue', x: 120, y: 210, label: 'remove me' },
  { id: 'tablet-c', sectionId: 'ruined-temple', type: 'camp', x: 240, y: 300, label: 'keep me' },
];
export const OTHER = [];`;

  const next = applyJourneyPropExportToSource(source, {
    room: 'desert-entry',
    props: [
      { id: 'tablet-a', sectionId: 'desert-entry', type: 'camp', x: 132, y: 224, depth: 'route-edge', layer: 'foreground', zIndex: 4, scale: 1.2, rotation: 15, label: 'updated camp' },
      { id: 'tablet-new', sectionId: 'desert-entry', type: 'atmosphere-prop', atmosphereAssetKey: 'torchStand', x: 180, y: 250, label: 'torch stand' },
    ],
    deletedPropIds: ['tablet-b'],
    platforms: [
      { id: 'ledge-a', sectionId: 'desert-entry', x: 336, y: 416, width: 120, height: 18, label: 'moved ledge' },
    ],
    hazards: [
      { id: 'trap-a', name: 'pressure plate', type: 'dart-launcher', x: 752, y: 320, width: 144, height: 38, triggerArea: { x: 4, y: -8, width: 120, height: 24 }, damage: 9, reset: true, cooldown: 1.6, depth: 'midground', direction: 'left', launcherX: 720, launcherY: 264, linkedObjectIds: ['door-a'], editorVisible: true, burial: 0.45, penalty: { stamina: 8 }, message: 'moved trap' },
    ],
    miniBosses: [
      { id: 'scarab-queen', name: 'Scarab Queen', x: 2150, y: 330, width: 92, height: 96, arenaStart: 2010, arenaEnd: 2250, lairX: 2180, lairY: 566, lairWidth: 520, lairHeight: 175, intro: 'moved lair' },
    ],
  });

  assert.match(next, /export const MINI_BOSSES = \[[\s\S]*?id: 'scarab-queen'[\s\S]*?lairX: 2180[\s\S]*?lairY: 566[\s\S]*?lairWidth: 520[\s\S]*?lairHeight: 175[\s\S]*?moved lair[\s\S]*?id: 'looter-captain'/);
  assert.match(next, /export const PLATFORMS = \[[\s\S]*?id: 'ledge-a'[\s\S]*?x: 336[\s\S]*?y: 416[\s\S]*?moved ledge[\s\S]*?id: 'ledge-b'/);
  assert.match(next, /export const HAZARDS = \[[\s\S]*?id: 'trap-a'[\s\S]*?type: 'dart-launcher'[\s\S]*?triggerArea: \{"x":4,"y":-8,"width":120,"height":24\}[\s\S]*?damage: 9[\s\S]*?reset: true[\s\S]*?direction: 'left'[\s\S]*?linkedObjectIds: \["door-a"\][\s\S]*?burial: 0\.45[\s\S]*?moved trap[\s\S]*?id: 'trap-b'/);
  assert.match(next, /id: 'tablet-a'[\s\S]*?x: 132[\s\S]*?rotation: 15/);
  assert.doesNotMatch(next, /id: 'tablet-b'/);
  assert.match(next, /id: 'tablet-c'[\s\S]*?keep me/);
  assert.match(next, /id: 'tablet-new'[\s\S]*?atmosphereAssetKey: 'torchStand'/);
  assert.match(next, /export const OTHER = \[\];/);
});
