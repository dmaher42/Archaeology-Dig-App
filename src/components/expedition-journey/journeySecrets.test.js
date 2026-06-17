import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  DYNAMIC_WORLD_EFFECT_REGIONS,
  DYNAMIC_WORLD_EFFECTS_SRC,
  DYNAMIC_WORLD_EFFECTS_VERSION,
  usesPaintedDynamicWorldEffect,
} from './journeyDynamicWorldAssets.js';
import {
  applyJourneyPropPlacementExportToProps,
  applyJourneyPropPlacementEdit,
  applyJourneyPlatformPlacementEdit,
  applyJourneyPlatformPlacementExportToPlatforms,
  applyJourneyHazardPlacementEdit,
  applyJourneyHazardPlacementExportToHazards,
  createJourneyPlatformFromPaletteItem,
  createJourneyPlatformPalette,
  createJourneyForegroundDetailsPalette,
  createJourneyGroundDetailsPalette,
  createJourneyPropFromPaletteItem,
  createJourneyPlacementChangeSummary,
  createJourneyPropPlacementExport,
  createJourneyPropPalette,
  createJourneyShardPropsPalette,
  duplicateJourneyPropForEditor,
  createForgottenMuralRelicSlidePuzzleTiles,
  getForgottenMuralRelicSlideMove,
  getJourneyPropRoomId,
  isForgottenMuralRelicSlidePuzzleSolved,
  makeEnemy,
  snapJourneyPropCoordinate,
} from './journeyUtils.js';
import { CHINA_ENEMIES, ENEMIES, RELIC_SHARDS, STORY_PROPS } from './journeyLevelData.js';
import {
  COMBAT_DAMAGE_SCALE,
  JOURNEY_HORIZONTAL_SCALE,
  WORLD_WIDTH,
  scaleJourneyX,
} from './journeyConstants.js';
import journeyPlacementOverrides from './journeyPlacementOverrides.generated.js';
import { journeyComponentSource } from './journeySourceText.test-utils.mjs';

const source = readFileSync(new URL('./journeyLevelData.js', import.meta.url), 'utf8');
const journeyUtilsSource = readFileSync(new URL('./journeyUtils.js', import.meta.url), 'utf8');
const journeyConstantsSource = readFileSync(new URL('./journeyConstants.js', import.meta.url), 'utf8');
const journeyCombatSource = readFileSync(new URL('./journeyCombat.js', import.meta.url), 'utf8');
const journeyDataRouterSource = readFileSync(new URL('./journeyDataRouter.js', import.meta.url), 'utf8');
const journeyEnemySpritesSource = readFileSync(new URL('./journeyEnemySprites.js', import.meta.url), 'utf8');
const journeyBossSpritesSource = readFileSync(new URL('./journeyBossSprites.js', import.meta.url), 'utf8');
const journeyMarkerSpritesSource = readFileSync(new URL('./journeyMarkerSprites.js', import.meta.url), 'utf8');
const journeyBackgroundAssetsSource = readFileSync(new URL('./journeyBackgroundAssets.js', import.meta.url), 'utf8');
const journeyCollectibleSpritesSource = readFileSync(new URL('./journeyCollectibleSprites.js', import.meta.url), 'utf8');
const journeyRenderAssetsSource = readFileSync(new URL('./journeyRenderAssets.js', import.meta.url), 'utf8');
const useJourneyRendererSource = readFileSync(new URL('./useJourneyRenderer.js', import.meta.url), 'utf8');
const journeyPlacementOverridesSource = readFileSync(new URL('./journeyPlacementOverrides.js', import.meta.url), 'utf8');
const journeyTrapsSource = readFileSync(new URL('./journeyTraps.js', import.meta.url), 'utf8');
const expeditionStagesSource = readFileSync(new URL('../expedition/expeditionStages.js', import.meta.url), 'utf8');
const devToolsSource = readFileSync(new URL('../DevTools.jsx', import.meta.url), 'utf8');
const expeditionModeSource = readFileSync(new URL('../ExpeditionMode.jsx', import.meta.url), 'utf8');
const menuSource = readFileSync(new URL('../Menu.jsx', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../../App.jsx', import.meta.url), 'utf8');
const indexCssSource = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');
const journeyCombatContractSource = journeyCombatSource.replace(/\bexport const\b/g, 'const');
const journeyGameplayContractSource = [
  journeyComponentSource,
  journeyCombatContractSource,
].join('\n');
const egyptPlayerAtlas = JSON.parse(
  readFileSync(new URL('../../../public/assets/expedition/player/asha-final-production-spritesheet.json', import.meta.url), 'utf8'),
);
const ashaV5PlayerAtlas = JSON.parse(
  readFileSync(new URL('../../../public/assets/expedition/player/asha-v5-spritesheet.json', import.meta.url), 'utf8'),
);
const ashaNewIdlePlayerAtlas = JSON.parse(
  readFileSync(new URL('../../../public/assets/expedition/player/asha-new-idle-spritesheet.json', import.meta.url), 'utf8'),
);
const ashaReferenceWarriorPlayerAtlas = JSON.parse(
  readFileSync(new URL('../../../public/assets/expedition/player/asha-reference-warrior-spritesheet.json', import.meta.url), 'utf8'),
);
const ashaReferenceWarriorDodgePreviewAtlas = JSON.parse(
  readFileSync(new URL('../../../public/assets/expedition/player/asha-reference-warrior-dodge-preview-spritesheet.json', import.meta.url), 'utf8'),
);
const ashaV2PlayerAtlas = JSON.parse(
  readFileSync(new URL('../../../public/assets/expedition/player/asha-v2-production-candidate-spritesheet.json', import.meta.url), 'utf8'),
);
const ashaV6HiresPlayerAtlas = JSON.parse(
  readFileSync(new URL('../../../public/assets/expedition/player/asha-v6-hires-spritesheet.json', import.meta.url), 'utf8'),
);

test('Journey world stretch uses the widened horizontal route scale', () => {
  assert.ok(JOURNEY_HORIZONTAL_SCALE >= 7.3);
  assert.equal(WORLD_WIDTH, scaleJourneyX(9060));
});

test('Journey renderer receives the horizontal scale helper used by platform drawing', () => {
  assert.match(useJourneyRendererSource, /scaleJourneyX,/);
  assert.match(useJourneyRendererSource, /platform\.x < scaleJourneyX\(720\)/);
  assert.match(journeyComponentSource, /useJourneyRenderer\(\{[\s\S]*?scaleJourneyX,[\s\S]*?worldToScreenX,/);
});

const egyptPreviousPlayerAtlas = JSON.parse(
  readFileSync(new URL('../../../public/assets/expedition/player/asha-hooded-warrior-explorer-spritesheet.json', import.meta.url), 'utf8'),
);
const egyptPlayerFallbackAtlas = JSON.parse(
  readFileSync(new URL('../../../public/assets/expedition/player/egypt-warrior-guide-spritesheet.json', import.meta.url), 'utf8'),
);
const egyptMarkerAtlas = JSON.parse(
  readFileSync(new URL('../../../public/assets/expedition/markers/egypt-checkpoint-flag-sprites.json', import.meta.url), 'utf8'),
);
const egyptAtmosphereAtlas = JSON.parse(
  readFileSync(new URL('../../../public/assets/expedition/environment/egypt-atmosphere/egypt-atmosphere-pack.json', import.meta.url), 'utf8'),
);
const lostSitePropRegistry = JSON.parse(
  readFileSync(new URL('./lostSitePropRegistry.json', import.meta.url), 'utf8'),
);
const mummificationChamberInteractionAtlas = JSON.parse(
  readFileSync(new URL('../../../public/assets/expedition/environment/desert-temple/mummification-chamber/mummification-chamber-interaction-atlas.json', import.meta.url), 'utf8'),
);
const desertEntryBackgroundAtlas = JSON.parse(
  readFileSync(new URL('../../../public/assets/expedition/backgrounds/desert-entry/desert-entry-parallax-pack.json', import.meta.url), 'utf8'),
);
const anubisBossAtlas = JSON.parse(
  readFileSync(new URL('../../../public/assets/expedition/bosses/anubis-sprites.json', import.meta.url), 'utf8'),
);
const besEnemyAtlas = JSON.parse(
  readFileSync(new URL('../../../public/assets/expedition/enemies/bes-guardian-sprites.json', import.meta.url), 'utf8'),
);
const egyptOpeningTrapDecalsPath = new URL('../../../public/assets/expedition/environment/egypt-opening/opening-trap-decals.png', import.meta.url);
const egyptOpeningHazardDecalsPath = new URL('../../../public/assets/expedition/environment/egypt-opening/opening-hazard-decals.png', import.meta.url);
const egyptOpeningTombStairwellPath = new URL('../../../public/assets/expedition/environment/egypt-opening/opening-tomb-stairwell.png', import.meta.url);
const forgottenMuralAlcoveClimbStructurePath = new URL('../../../public/assets/expedition/environment/desert-temple/forgotten-mural-alcove-climb-structure.png', import.meta.url);
const forgottenMuralChamberSourcePath = new URL('../../../public/assets/expedition/environment/desert-temple/forgotten-mural-chamber-source.png', import.meta.url);
const forgottenMuralChamberPath = new URL('../../../public/assets/expedition/environment/desert-temple/forgotten-mural-chamber.png', import.meta.url);
const forgottenMuralHiddenRevealPath = new URL('../../../public/assets/expedition/environment/desert-temple/forgotten-mural-hidden-memory-reveal-2026-06-01.png', import.meta.url);
const mummificationChamberExteriorPath = new URL('../../../public/assets/expedition/environment/desert-temple/mummification-chamber-exterior-ledged-building-2026-06-12.png', import.meta.url);
const mummificationChamberInteriorPath = new URL('../../../public/assets/expedition/environment/desert-temple/mummification-chamber-interior-side-scroll-2026-05-31.png', import.meta.url);
const scribeChamberExteriorPath = new URL('../../../public/assets/expedition/environment/desert-temple/scribe-locked-chamber-exterior-climb-structure-v3.png', import.meta.url);
const scribeChamberInteriorPath = new URL('../../../public/assets/expedition/environment/desert-temple/scribe-locked-chamber-interior-2026-06-01.png', import.meta.url);
const mummificationChamberInteractionAtlasPath = new URL('../../../public/assets/expedition/environment/desert-temple/mummification-chamber/mummification-chamber-interaction-atlas.png', import.meta.url);
const desertEntryGroundingOverlayPath = new URL('../../../public/assets/expedition/backgrounds/desert-entry/desert-entry-grounding-overlay.png', import.meta.url);
const desertEntryPremiumCausewayLanePath = new URL('../../../public/assets/expedition/backgrounds/desert-entry/desert-entry-premium-causeway-lane.png', import.meta.url);
const egyptForegroundDepthAtlasPath = new URL('../../../public/assets/expedition/environment/egypt-foreground/egypt-foreground-depth-pack.json', import.meta.url);
const egyptForegroundDepthPngPath = new URL('../../../public/assets/expedition/environment/egypt-foreground/egypt-foreground-depth-pack.png', import.meta.url);
const ashaComboSlashEffectPath = new URL('../../../public/assets/expedition/player/asha-combo-slash-effect-2026-06-06.png', import.meta.url);
const ashaFinisherSlashEffectPath = new URL('../../../public/assets/expedition/player/asha-finisher-slash-effect-2026-06-06.png', import.meta.url);
const extractExportedArray = (name) => {
  const startToken = `export const ${name} = [`;
  const start = source.indexOf(startToken);
  assert.notEqual(start, -1, `${name} export should exist`);
  const bodyStart = start + startToken.length - 1;
  let depth = 0;
  for (let index = bodyStart; index < source.length; index += 1) {
    const char = source[index];
    if (char === '[') depth += 1;
    if (char === ']') depth -= 1;
    if (depth === 0) return source.slice(bodyStart, index + 1);
  }
  throw new Error(`${name} export should close its array`);
};

const getDataRowById = (arraySource, id) => {
  const idPattern = new RegExp(`id:\\s*'${id}'`);
  const match = arraySource.match(idPattern);
  if (!match) return '';
  const idIndex = match.index;
  let startBracket = -1;
  for (let i = idIndex; i >= 0; i -= 1) {
    if (arraySource[i] === '{') {
      startBracket = i;
      break;
    }
  }
  if (startBracket === -1) return '';
  let depth = 0;
  for (let i = startBracket; i < arraySource.length; i += 1) {
    if (arraySource[i] === '{') depth += 1;
    if (arraySource[i] === '}') {
      depth -= 1;
      if (depth === 0) return arraySource.slice(startBracket, i + 1);
    }
  }
  return '';
};

const rendererFrameFunctionNames = {
  drawPropGroundContact: 'drawPropGroundContactFrame',
  drawPropSandOcclusion: 'drawPropSandOcclusionFrame',
  drawStoryProp: 'drawStoryPropFrame',
};

const getComponentFunctionSource = (functionName) => {
  const frameFunctionName = rendererFrameFunctionNames[functionName] || functionName;
  const exportFunctionToken = `export function ${frameFunctionName}(`;
  const exportFunctionStart = journeyComponentSource.indexOf(exportFunctionToken);
  if (exportFunctionStart !== -1) {
    const remainderStart = exportFunctionStart + exportFunctionToken.length;
    const nextExportFunctionOffset = journeyComponentSource.slice(remainderStart).search(/\nexport function /);
    assert.notEqual(nextExportFunctionOffset, -1, `${frameFunctionName} source should have a following exported function`);
    return journeyComponentSource.slice(exportFunctionStart, remainderStart + nextExportFunctionOffset);
  }

  const start = journeyComponentSource.indexOf(`const ${functionName} =`);
  assert.notEqual(start, -1, `${functionName} should exist`);
  const remainderStart = start + functionName.length;
  const nextFunctionOffset = journeyComponentSource.slice(remainderStart).search(/\n {2}const [A-Za-z_{]/);
  assert.notEqual(nextFunctionOffset, -1, `${functionName} source should have a following component function`);
  return journeyComponentSource.slice(start, remainderStart + nextFunctionOffset);
};

test('journey prop placement helpers preserve canonical prop fields while editing', () => {
  const prop = {
    id: 'test-tablet',
    sectionId: 'desert-entry',
    type: 'atmosphere-prop',
    x: 2055,
    y: 557,
    depth: 'midground',
    layer: 'ruin-detail',
    zIndex: 2,
    label: 'test tablet',
  };

  assert.equal(getJourneyPropRoomId(prop, 'egypt-exterior-route', 'ruined-temple'), 'desert-entry');
  assert.equal(getJourneyPropRoomId({ id: 'inner', sceneId: 'mummification-chamber' }, 'egypt-exterior-route', 'desert-entry'), 'mummification-chamber');
  assert.equal(snapJourneyPropCoordinate(2059, 16), 2064);

  const edited = applyJourneyPropPlacementEdit(prop, {
    x: 2064,
    y: 544,
    yOffset: -10,
    width: 96,
    height: 128,
    scale: 1.25,
    rotation: -12,
    mirrorX: true,
    brightness: 1.25,
    depth: 'route-edge',
    layer: 'foreground',
    zIndex: 5,
    shadowOpacity: 0.22,
    shadowWidth: 118,
    shadowHeight: 34,
    sandOverlapHeight: 18,
    sandMoundWidth: 132,
    sandMoundHeight: 28,
    groundPebbles: 6,
    colorGradeFilter: 'sepia(0.16) saturate(0.9)',
    groundContactLayer: [
      {
        layer: 'overlay',
        assetKey: 'premiumLongSandLip',
        xRatio: 0.5,
        widthRatio: 0.8,
        height: 58,
        yOffset: -50,
        rotation: -3,
        mirrorX: true,
        alpha: 0.64,
        filter: 'sepia(12%)',
      },
    ],
  });

  assert.deepEqual(edited, {
    ...prop,
    x: 2064,
    y: 544,
    yOffset: -10,
    width: 96,
    height: 128,
    scale: 1.25,
    rotation: -12,
    mirrorX: true,
    brightness: 1.25,
    depth: 'route-edge',
    layer: 'foreground',
    zIndex: 5,
    shadowOpacity: 0.22,
    shadowWidth: 118,
    shadowHeight: 34,
    sandOverlapHeight: 18,
    sandMoundWidth: 132,
    sandMoundHeight: 28,
    groundPebbles: 6,
    colorGradeFilter: 'sepia(0.16) saturate(0.9)',
    groundContactLayer: [
      {
        layer: 'overlay',
        assetKey: 'premiumLongSandLip',
        xRatio: 0.5,
        widthRatio: 0.8,
        height: 58,
        yOffset: -50,
        rotation: -3,
        mirrorX: true,
        alpha: 0.64,
        filter: 'sepia(12%)',
      },
    ],
  });
  assert.notEqual(edited, prop);
  assert.notEqual(edited.groundContactLayer, prop.groundContactLayer);
});

test('journey prop placement export uses the existing STORY_PROPS object shape', () => {
  const exportJson = createJourneyPropPlacementExport({
    source: 'src/components/expedition-journey/journeyLevelData.js::STORY_PROPS',
    roomId: 'desert-entry',
    props: [
      { id: 'tablet-a', sectionId: 'desert-entry', type: 'atmosphere-prop', x: 100, y: 200, depth: 'midground' },
      { id: 'tablet-b', sectionId: 'desert-entry', type: 'atmosphere-prop', x: 120, y: 210, layer: 'foreground', zIndex: 3 },
    ],
    deletedPropIds: ['old-marker'],
  });

  const parsed = JSON.parse(exportJson);
  assert.equal(parsed.source, 'src/components/expedition-journey/journeyLevelData.js::STORY_PROPS');
  assert.equal(parsed.room, 'desert-entry');
  assert.deepEqual(parsed.deletedPropIds, ['old-marker']);
  assert.deepEqual(parsed.props[0], {
    id: 'tablet-a',
    sectionId: 'desert-entry',
    type: 'atmosphere-prop',
    x: 100,
    y: 200,
    depth: 'midground',
  });
  assert.deepEqual(parsed.props[1], {
    id: 'tablet-b',
    sectionId: 'desert-entry',
    type: 'atmosphere-prop',
    x: 120,
    y: 210,
    layer: 'foreground',
    zIndex: 3,
  });
});

test('journey placement editor summarises unsaved changes before export', () => {
  const summary = createJourneyPlacementChangeSummary({
    edits: {
      'tablet-a': { x: 120 },
      'empty-edit': {},
    },
    platformEdits: {
      'ledge-a': { y: 330 },
    },
    hazardEdits: {
      'pit-a': { x: 420 },
    },
    routeGateEdits: {
      'gate-a': { width: 220 },
    },
    routeGateDoorwayEdits: {
      'doorway-a': { y: 500 },
    },
    checkpointEdits: {
      'checkpoint-a': { x: 680 },
    },
    miniBossEdits: {
      'scarab-queen': { lairX: 12149 },
    },
    createdProps: [{ id: 'new-statue' }],
    createdHazards: [{ id: 'new-trap' }],
    deletedIds: new Set(['old-marker']),
    deletedPlatformIds: new Set(['old-ledge']),
    deletedHazardIds: new Set(['old-pit']),
  }, { limit: 6 });

  assert.equal(summary.totalCount, 12);
  assert.equal(summary.hiddenCount, 6);
  assert.deepEqual(summary.entries.map(entry => entry.label), [
    'Prop tablet-a edited',
    'Prop new-statue added',
    'Prop old-marker deleted',
    'Platform ledge-a edited',
    'Platform old-ledge deleted',
    'Trap pit-a edited',
  ]);
});

test('journey placement editor keeps export panel manual after selecting or moving items', () => {
  assert.doesNotMatch(journeyComponentSource, /editor\.exportVisible\s*=\s*Boolean\(editor\.exportText\)/);
  assert.match(journeyComponentSource, /createJourneyPlacementChangeSummary/);
  assert.match(journeyComponentSource, /unsavedChangeSummary/);
});

test('journey prop editor palette derives reusable prop options from existing story props', () => {
  const palette = createJourneyPropPalette([
    { id: 'torch-a', sectionId: 'ruined-temple', type: 'atmosphere-prop', atmosphereAssetKey: 'torchStand', label: 'small torch marker', width: 46, height: 84, colorGradeFilter: 'none' },
    { id: 'torch-b', sectionId: 'catacombs', type: 'atmosphere-prop', atmosphereAssetKey: 'torchStand', label: 'torch at catacomb descent', width: 48, height: 88 },
    { id: 'statue-a', sectionId: 'desert-entry', type: 'statue', label: 'ram statue marker' },
  ]);

  assert.equal(palette.length, 2);
  assert.deepEqual(palette[0], {
    key: 'atmosphere-prop:torchStand',
    label: 'Torch Stand',
    type: 'atmosphere-prop',
    atmosphereAssetKey: 'torchStand',
    template: {
      type: 'atmosphere-prop',
      atmosphereAssetKey: 'torchStand',
      width: 46,
      height: 84,
      colorGradeFilter: 'none',
    },
  });
  assert.equal(palette[1].key, 'statue');
  assert.equal(palette[1].label, 'Statue');
});

test('journey prop editor palette includes reusable Lost Site prop registry entries', () => {
  const palette = createJourneyPropPalette([], [
    {
      id: 'cracked_stone_blocks',
      displayName: 'Cracked Stone Blocks',
      category: 'Tomb Architecture',
      assetPath: 'assets/expedition/environment/egypt-atmosphere/props/lost-site-expedition/cracked_stone_blocks.png',
      defaultScale: 1,
      defaultLayer: 'foreground',
      defaultColorGradeFilter: 'sepia(34%) saturate(135%) brightness(88%) contrast(102%)',
      defaultShadowOpacity: 0.2,
      defaultSandOverlapHeight: 9,
      defaultSandMoundWidth: 112,
      defaultGroundPebbles: 4,
      collidable: false,
      inspectable: false,
    },
    {
      id: 'routeGateFront',
      displayName: 'Route Gate Front',
      category: 'Route Gate Architecture',
      assetPath: 'assets/expedition/environment/egypt-opening/route-gate-front.png',
      imageAssetKey: 'routeGateFront',
      defaultType: 'route-gate-prop',
      defaultWidth: 316,
      defaultHeight: 210,
      defaultScale: 1,
      defaultLayer: 'foreground',
      defaultDepth: 'foreground-occluder',
      collidable: false,
      inspectable: false,
    },
  ]);

  assert.deepEqual(palette, [
    {
      key: 'atmosphere-prop:cracked_stone_blocks',
      label: 'Cracked Stone Blocks',
      type: 'atmosphere-prop',
      atmosphereAssetKey: 'cracked_stone_blocks',
      category: 'Tomb Architecture',
      assetPath: 'assets/expedition/environment/egypt-atmosphere/props/lost-site-expedition/cracked_stone_blocks.png',
      template: {
        type: 'atmosphere-prop',
        atmosphereAssetKey: 'cracked_stone_blocks',
        scale: 1,
        layer: 'foreground',
        colorGradeFilter: 'sepia(34%) saturate(135%) brightness(88%) contrast(102%)',
        shadowOpacity: 0.2,
        sandOverlapHeight: 9,
        sandMoundWidth: 112,
        groundPebbles: 4,
      },
    },
    {
      key: 'route-gate-prop:routeGateFront',
      label: 'Route Gate Front',
      type: 'route-gate-prop',
      imageAssetKey: 'routeGateFront',
      category: 'Route Gate Architecture',
      assetPath: 'assets/expedition/environment/egypt-opening/route-gate-front.png',
      template: {
        type: 'route-gate-prop',
        imageAssetKey: 'routeGateFront',
        assetPath: 'assets/expedition/environment/egypt-opening/route-gate-front.png',
        width: 316,
        height: 210,
        scale: 1,
        layer: 'foreground',
        depth: 'foreground-occluder',
      },
    },
  ]);
});

test('journey editor exposes premium Egypt ground details as reusable palette props', () => {
  const palette = createJourneyGroundDetailsPalette();
  const paletteKeys = palette.map(item => item.key);

  assert.ok(palette.length >= 8);
  assert.ok(paletteKeys.includes('ground-detail:premiumLongSandLip'));
  assert.ok(paletteKeys.includes('ground-detail:premiumSmallStoneScatter'));
  assert.ok(paletteKeys.includes('ground-detail:premiumRubbleContactShadow'));
  palette.forEach((item) => {
    assert.equal(item.category, 'Ground Details');
    assert.equal(item.type, 'ground-contact-detail-prop');
    assert.equal(item.template.type, 'ground-contact-detail-prop');
    assert.equal(item.template.shadowOpacity, 0);
    assert.equal(item.template.sandOverlapHeight, 0);
    assert.equal(item.template.groundPebbles, 0);
    assert.equal(item.template.brightness, 1);
    assert.equal(item.template.colorGradeFilter, '');
    assert.equal(item.template.groundContactLayer.length, 1);
    assert.equal(item.template.groundContactLayer[0].assetKey, item.assetKey);
  });
});

test('journey editor creates ground detail props through the canonical prop factory', () => {
  const paletteItem = createJourneyGroundDetailsPalette()
    .find(item => item.key === 'ground-detail:premiumSmallStoneScatter');

  const created = createJourneyPropFromPaletteItem({
    paletteItem,
    roomId: 'desert-entry',
    x: 712,
    y: 510,
    existingIds: ['desert-entry-premium-small-stone-scatter-1'],
  });

  assert.equal(created.id, 'desert-entry-premium-small-stone-scatter-2');
  assert.equal(created.sectionId, 'desert-entry');
  assert.equal(created.type, 'ground-contact-detail-prop');
  assert.equal(created.label, 'small stone scatter');
  assert.equal(created.shadowOpacity, 0);
  assert.equal(created.sandOverlapHeight, 0);
  assert.equal(created.groundPebbles, 0);
  assert.equal(created.brightness, 1);
  assert.equal(created.colorGradeFilter, '');
  assert.deepEqual(created.groundContactLayer, [
    {
      assetKey: 'premiumSmallStoneScatter',
      layer: 'overlay',
      xRatio: 0.5,
      widthRatio: 1,
      height: 55,
      yOffset: -55,
      alpha: 0.64,
      mode: 'stretch',
      alignY: 'bottom',
    },
  ]);
});

test('journey editor exposes Egypt foreground depth assets as reusable palette props', () => {
  const palette = createJourneyForegroundDetailsPalette();
  const paletteKeys = palette.map(item => item.key);

  assert.ok(palette.length >= 12);
  assert.ok(paletteKeys.includes('foreground-detail:leftBrokenColumn'));
  assert.ok(paletteKeys.includes('foreground-detail:softSandDrift'));
  assert.ok(paletteKeys.includes('foreground-detail:buriedCarvedHead'));
  assert.ok(paletteKeys.includes('foreground-detail:egyptStructureBaseRubble'));
  assert.ok(!paletteKeys.includes('foreground-detail:lowDustVeil'));
  assert.ok(!paletteKeys.includes('foreground-detail:egyptGroundSkirtLong'));
  assert.ok(!paletteKeys.includes('foreground-detail:egyptGroundSkirtShort'));
  palette.forEach((item) => {
    assert.equal(item.category, 'Foreground Details');
    assert.equal(item.type, 'foreground-depth-detail-prop');
    assert.equal(item.template.type, 'foreground-depth-detail-prop');
    assert.equal(item.template.shadowOpacity, 0);
    assert.equal(item.template.sandOverlapHeight, 0);
    assert.equal(item.template.groundPebbles, 0);
    assert.equal(item.template.brightness, 1);
    assert.equal(item.template.colorGradeFilter, '');
    assert.equal(item.template.groundContactLayer.length, 1);
    assert.equal(item.template.groundContactLayer[0].assetKey, item.assetKey);
  });
});

test('journey editor creates foreground detail props through the canonical prop factory', () => {
  const paletteItem = createJourneyForegroundDetailsPalette()
    .find(item => item.key === 'foreground-detail:buriedCarvedHead');

  const created = createJourneyPropFromPaletteItem({
    paletteItem,
    roomId: 'desert-entry',
    x: 1240,
    y: 526,
    existingIds: ['desert-entry-buried-carved-head-1'],
  });

  assert.equal(created.id, 'desert-entry-buried-carved-head-2');
  assert.equal(created.sectionId, 'desert-entry');
  assert.equal(created.type, 'foreground-depth-detail-prop');
  assert.equal(created.label, 'buried carved head');
  assert.equal(created.foregroundDetailAssetKey, 'buriedCarvedHead');
  assert.equal(created.shadowOpacity, 0);
  assert.equal(created.sandOverlapHeight, 0);
  assert.equal(created.groundPebbles, 0);
  assert.equal(created.brightness, 1);
  assert.equal(created.colorGradeFilter, '');
  assert.deepEqual(created.groundContactLayer, [
    {
      assetKey: 'buriedCarvedHead',
      layer: 'overlay',
      xRatio: 0.5,
      widthRatio: 1,
      height: 118,
      yOffset: -118,
      alpha: 0.88,
      mode: 'contain',
      alignY: 'bottom',
    },
  ]);
});

test('journey editor exposes collectible shard PNGs as reusable palette props', () => {
  const palette = createJourneyShardPropsPalette();
  const paletteKeys = palette.map(item => item.key);

  assert.ok(palette.length >= 9);
  assert.ok(paletteKeys.includes('shard-prop:scarabWingFragment'));
  assert.ok(paletteKeys.includes('shard-prop:muralFaienceFragment'));
  assert.ok(paletteKeys.includes('shard-prop:royalRecordFragment'));
  palette.forEach((item) => {
    assert.equal(item.category, 'Shards');
    assert.equal(item.type, 'collectible-shard-prop');
    assert.equal(item.collectibleSpriteKey, item.template.collectibleSpriteKey);
    assert.equal(item.template.type, 'collectible-shard-prop');
    assert.equal(item.template.depth, 'foreground');
    assert.equal(item.template.layer, 'foreground');
    assert.equal(item.template.brightness, 1);
    assert.equal(item.template.colorGradeFilter, '');
    assert.equal(item.template.shadowOpacity, 0.18);
  });
});

test('journey editor creates collectible shard props through the canonical prop factory', () => {
  const paletteItem = createJourneyShardPropsPalette()
    .find(item => item.key === 'shard-prop:scarabWingFragment');

  const created = createJourneyPropFromPaletteItem({
    paletteItem,
    roomId: 'desert-entry',
    x: 934,
    y: 320,
    existingIds: ['desert-entry-scarab-wing-fragment-1'],
  });

  assert.equal(created.id, 'desert-entry-scarab-wing-fragment-2');
  assert.equal(created.sectionId, 'desert-entry');
  assert.equal(created.type, 'collectible-shard-prop');
  assert.equal(created.label, 'scarab wing fragment');
  assert.equal(created.collectibleSpriteKey, 'scarabWingFragment');
  assert.equal(created.width, 42);
  assert.equal(created.height, 42);
  assert.equal(created.alpha, 1);
  assert.equal(created.brightness, 1);
  assert.equal(created.colorGradeFilter, '');
  assert.equal(created.shadowOpacity, 0.18);
});

test('journey prop editor wires shard props into the palette UI and collectible atlas renderer', () => {
  assert.match(journeyComponentSource, /createJourneyShardPropsPalette/);
  assert.match(journeyComponentSource, /const shardPropsEditorPalette = useMemo\(\(\) => createJourneyShardPropsPalette\(\), \[\]\)/);
  assert.match(journeyComponentSource, /selectedPaletteCategory === 'shard-prop'[\s\S]*?shardPropsEditorPalette/);
  assert.match(journeyComponentSource, /\['shard-prop', 'Shards'\]/);
  assert.match(journeyComponentSource, /prop\.type === 'collectible-shard-prop'/);
  assert.match(journeyComponentSource, /drawCollectibleAtlasRegion\([\s\S]*?prop\.collectibleSpriteKey/);
});

test('journey prop editor creates and duplicates props using canonical prop fields', () => {
  const paletteItem = {
    type: 'atmosphere-prop',
    atmosphereAssetKey: 'fieldChest',
    template: {
      type: 'atmosphere-prop',
      atmosphereAssetKey: 'fieldChest',
      width: 86,
      height: 58,
      depth: 'midground',
      layer: 'default',
      colorGradeFilter: 'none',
    },
  };

  const created = createJourneyPropFromPaletteItem({
    paletteItem,
    roomId: 'desert-entry',
    x: 520,
    y: 544,
    existingIds: ['desert-entry-field-chest-1'],
  });

  assert.deepEqual(created, {
    id: 'desert-entry-field-chest-2',
    sectionId: 'desert-entry',
    type: 'atmosphere-prop',
    atmosphereAssetKey: 'fieldChest',
    width: 86,
    height: 58,
    depth: 'midground',
    layer: 'default',
    colorGradeFilter: 'none',
    x: 520,
    y: 544,
    label: 'field chest',
  });

  const edited = applyJourneyPropPlacementEdit(created, {
    scale: 1.25,
    rotation: -15,
    mirrorX: true,
    brightness: 1.2,
  });
  assert.equal(edited.scale, 1.25);
  assert.equal(edited.rotation, -15);
  assert.equal(edited.mirrorX, true);
  assert.equal(edited.brightness, 1.2);

  const duplicate = duplicateJourneyPropForEditor({
    prop: edited,
    existingIds: [created.id],
  });
  assert.equal(duplicate.id, 'desert-entry-field-chest-2-copy-1');
  assert.equal(duplicate.x, 552);
  assert.equal(duplicate.y, 512);
  assert.equal(duplicate.scale, 1.25);
  assert.equal(duplicate.rotation, -15);
  assert.equal(duplicate.mirrorX, true);
  assert.equal(duplicate.brightness, 1.2);
});

test('journey prop placement export can merge updates, additions, and deletions into story props', () => {
  const existingProps = [
    { id: 'tablet-a', sectionId: 'desert-entry', type: 'atmosphere-prop', x: 100, y: 200, depth: 'midground' },
    { id: 'tablet-b', sectionId: 'desert-entry', type: 'atmosphere-prop', x: 120, y: 210, layer: 'foreground' },
    { id: 'tablet-c', sectionId: 'ruined-temple', type: 'camp', x: 240, y: 300 },
  ];

  const nextProps = applyJourneyPropPlacementExportToProps({
    existingProps,
    exportData: {
      room: 'desert-entry',
      props: [
        { id: 'tablet-a', sectionId: 'desert-entry', type: 'atmosphere-prop', x: 132, y: 224, depth: 'route-edge', layer: 'foreground', zIndex: 4, scale: 1.2, rotation: 15 },
        { id: 'tablet-new', sectionId: 'desert-entry', type: 'camp', x: 180, y: 250, layer: 'default' },
      ],
      deletedPropIds: ['tablet-b'],
    },
  });

  assert.deepEqual(nextProps, [
    { id: 'tablet-a', sectionId: 'desert-entry', type: 'atmosphere-prop', x: 132, y: 224, depth: 'route-edge', layer: 'foreground', zIndex: 4, scale: 1.2, rotation: 15 },
    { id: 'tablet-c', sectionId: 'ruined-temple', type: 'camp', x: 240, y: 300 },
    { id: 'tablet-new', sectionId: 'desert-entry', type: 'camp', x: 180, y: 250, layer: 'default' },
  ]);
  assert.deepEqual(existingProps[0], { id: 'tablet-a', sectionId: 'desert-entry', type: 'atmosphere-prop', x: 100, y: 200, depth: 'midground' });
});

test('journey platform placement helpers preserve canonical platform fields while editing', () => {
  const platform = {
    id: 'route-platform-a',
    sectionId: 'ruined-temple',
    x: 1420,
    y: 440,
    width: 128,
    height: 18,
    layer: 'stone-route',
    reactive: { type: 'crumble', delay: 1.4 },
  };

  const edited = applyJourneyPlatformPlacementEdit(platform, {
    x: 1440,
    y: 416,
  });

  assert.deepEqual(edited, {
    ...platform,
    x: 1440,
    y: 416,
  });
  assert.notEqual(edited, platform);
});

test('journey platform palette keeps blocker tools compact and editable', () => {
  const palette = createJourneyPlatformPalette();
  const blockerItems = palette.filter(item => item.template.collision === 'blocker');

  assert.deepEqual(blockerItems.map(item => item.label), [
    'Blocker',
    'Left Slant Blocker',
    'Right Slant Blocker',
  ]);
  assert.equal(palette.some(item => item.label === 'Low Blocker'), false);
  assert.equal(palette.some(item => item.label === 'Tall Blocker'), false);
  assert.equal(palette.some(item => item.label === 'Wide Blocker'), false);

  const plainBlocker = blockerItems.find(item => item.label === 'Blocker');
  const leftSlant = blockerItems.find(item => item.label === 'Left Slant Blocker');
  const rightSlant = blockerItems.find(item => item.label === 'Right Slant Blocker');

  assert.equal(plainBlocker?.template.collision, 'blocker');
  assert.equal(leftSlant?.template.blockerShape, 'left-slant');
  assert.equal(rightSlant?.template.blockerShape, 'right-slant');

  const created = createJourneyPlatformFromPaletteItem({
    paletteItem: leftSlant,
    roomId: 'desert-entry',
    x: 840,
    y: 348,
    existingIds: [],
  });

  assert.equal(created.collision, 'blocker');
  assert.equal(created.blockerShape, 'left-slant');

  const edited = applyJourneyPlatformPlacementEdit(created, {
    width: 36,
    height: 124,
    blockerShape: 'right-slant',
  });

  assert.equal(edited.width, 36);
  assert.equal(edited.height, 124);
  assert.equal(edited.blockerShape, 'right-slant');
  assert.match(journeyUtilsSource, /if \(platform\?\.collision === 'blocker'\) return false;/);
  assert.match(journeyComponentSource, /const isJourneyBlockerPlatform = \(platform = \{\}\) => platform\.collision === 'blocker';/);
  assert.match(journeyPlacementOverridesSource, /'blockerShape'/);
});

test('journey placement export can merge platform position updates', () => {
  const existingPlatforms = [
    { id: 'route-platform-a', sectionId: 'ruined-temple', x: 1420, y: 440, width: 128, height: 18 },
    { id: 'route-platform-b', sectionId: 'ruined-temple', x: 1610, y: 388, width: 96, height: 18 },
  ];

  const exportJson = createJourneyPropPlacementExport({
    roomId: 'ruined-temple',
    props: [],
    platforms: [
      { id: 'route-platform-a', sectionId: 'ruined-temple', x: 1440, y: 416, width: 128, height: 18, collision: 'blocker' },
    ],
  });
  const parsed = JSON.parse(exportJson);

  assert.equal(parsed.platformSource, 'src/components/expedition-journey/journeyLevelData.js::PLATFORMS');
  assert.deepEqual(parsed.platforms, [
    { id: 'route-platform-a', sectionId: 'ruined-temple', x: 1440, y: 416, width: 128, height: 18, collision: 'blocker' },
  ]);
  assert.deepEqual(applyJourneyPlatformPlacementExportToPlatforms({
    existingPlatforms,
    exportData: parsed,
  }), [
    { id: 'route-platform-a', sectionId: 'ruined-temple', x: 1440, y: 416, width: 128, height: 18, collision: 'blocker' },
    { id: 'route-platform-b', sectionId: 'ruined-temple', x: 1610, y: 388, width: 96, height: 18 },
  ]);
});

test('journey hazard placement helpers preserve canonical trap fields while editing', () => {
  const hazard = {
    id: 'entry-pressure-plate',
    name: 'pressure plate',
    x: 735,
    y: 326,
    width: 126,
    height: 34,
    penalty: { stamina: 8, time: 3 },
    message: 'A carved pressure plate shuddered beneath you.',
  };

  const edited = applyJourneyHazardPlacementEdit(hazard, {
    x: 752,
    y: 320,
    width: 144,
    height: 38,
    burial: 0.45,
  });

  assert.deepEqual(edited, {
    ...hazard,
    x: 752,
    y: 320,
    width: 144,
    height: 38,
    burial: 0.45,
  });
  assert.notEqual(edited, hazard);
});

test('journey placement export can merge trap position updates', () => {
  const existingHazards = [
    { id: 'entry-pressure-plate', name: 'pressure plate', x: 735, y: 326, width: 126, height: 34 },
    { id: 'sand-pit', name: 'soft sand trap', x: 1060, y: 328, width: 132, height: 32 },
  ];

  const exportJson = createJourneyPropPlacementExport({
    roomId: 'desert-entry',
    hazards: [
      { id: 'entry-pressure-plate', name: 'pressure plate', x: 752, y: 320, width: 144, height: 38 },
    ],
  });
  const parsed = JSON.parse(exportJson);

  assert.equal(parsed.hazardSource, 'src/components/expedition-journey/journeyLevelData.js::HAZARDS');
  assert.deepEqual(parsed.hazards, [
    { id: 'entry-pressure-plate', name: 'pressure plate', x: 752, y: 320, width: 144, height: 38 },
  ]);
  assert.deepEqual(applyJourneyHazardPlacementExportToHazards({
    existingHazards,
    exportData: parsed,
  }), [
    { id: 'entry-pressure-plate', name: 'pressure plate', x: 752, y: 320, width: 144, height: 38 },
    { id: 'sand-pit', name: 'soft sand trap', x: 1060, y: 328, width: 132, height: 32 },
  ]);
});

test('journey editor prioritises platform selection over building props', () => {
  assert.match(
    journeyComponentSource,
    /const selectedSolidPlatform = selectedHazard \|\| selectedLair \|\| selectedCheckpoint \|\| selectedArch \|\| selectedForcedFloor[\s\S]{0,180}findEditablePlatformAt\(pointer\.screenX, pointer\.screenY, \{ includeFloors: false \}\);[\s\S]{0,260}const selectedProp = selectedHazard \|\| selectedLair \|\| selectedCheckpoint \|\| selectedArch \|\| selectedForcedFloor \|\| selectedSolidPlatform \? null : findEditableStoryPropAt\(pointer\.screenX, pointer\.screenY\);/,
  );
  assert.match(
    journeyComponentSource,
    /getRenderableStoryProps\(current\)\.forEach[\s\S]*?getRenderablePlatforms\(current\)\.forEach[\s\S]*?const selectedPlatform = getPropEditorSelectedPlatform\(current\);/,
  );
});

test('journey editor prioritises trap selection above platforms and building props', () => {
  const floorSelectionIndex = journeyComponentSource.indexOf('const selectedForcedFloor = editor.floorPickMode');
  const hazardSelectionIndex = journeyComponentSource.indexOf('const selectedHazard = selectedForcedFloor ? null : findEditableHazardAt(pointer.screenX, pointer.screenY);');
  const platformSelectionIndex = journeyComponentSource.indexOf('const selectedSolidPlatform = selectedHazard || selectedLair || selectedCheckpoint || selectedArch || selectedForcedFloor');
  const propSelectionIndex = journeyComponentSource.indexOf('const selectedProp = selectedHazard || selectedLair || selectedCheckpoint || selectedArch || selectedForcedFloor || selectedSolidPlatform ? null : findEditableStoryPropAt(pointer.screenX, pointer.screenY);');
  assert.ok(floorSelectionIndex > -1, 'floor override should be checked before crowded editor layers');
  assert.ok(hazardSelectionIndex > floorSelectionIndex, 'hazard selection should still run before normal platforms when no floor is forced');
  assert.ok(platformSelectionIndex > hazardSelectionIndex, 'platform selection should be blocked by selected hazards');
  assert.ok(propSelectionIndex > platformSelectionIndex, 'prop selection should be blocked by selected hazards and platforms');
  assert.match(
    journeyComponentSource,
    /getRenderablePlatforms\(current\)\.forEach[\s\S]*?getRenderableHazards\(current\)\.forEach[\s\S]*?const selectedHazard = getPropEditorSelectedHazard\(current\);/,
  );
  assert.match(journeyComponentSource, /updateSelectedHazardEditorTransform/);
  assert.match(journeyComponentSource, /selectedHazard[\s\S]*?<span>Width<\/span>[\s\S]*?updateSelectedHazardEditorTransform\(\{ width:/);
});

test('journey editor exposes platform resizing and robust prop scale shortcuts', () => {
  assert.match(journeyComponentSource, /updateSelectedPlatformEditorTransform/);
  assert.match(journeyComponentSource, /selectedPlatform[\s\S]*?<span>Width<\/span>[\s\S]*?updateSelectedPlatformEditorTransform\(\{ width:/);
  assert.match(journeyComponentSource, /updateSelectedPropEditorTransform\(\{ width:/);
  assert.match(journeyComponentSource, /updateSelectedPropEditorTransform\(\{[\s\S]*?height,/);
  assert.match(journeyComponentSource, /event\.key === '\+' \|\| event\.key === '\*'/);
  assert.match(journeyComponentSource, /event\.key === '-' \|\| event\.key === '_'/);
  assert.match(journeyComponentSource, /<span>Scale<\/span>[\s\S]*?updateSelectedPropEditorTransform\(\{ scale:/);
  assert.match(journeyComponentSource, /<span>Flip H<\/span>[\s\S]*?updateSelectedPropEditorTransform\(\{ mirrorX:/);
  assert.match(journeyComponentSource, /<span>Flip V<\/span>[\s\S]*?updateSelectedPropEditorTransform\(\{ mirrorY:/);
  assert.match(journeyComponentSource, /<span>Brightness<\/span>[\s\S]*?updateSelectedPropEditorNumberField\('brightness'/);
  assert.match(journeyComponentSource, /brightness\(\$\{Math\.round\(clamp\(propSize\.brightness,\s*0\.4,\s*1\.8\) \* 100\)\}%\)/);
  assert.match(journeyComponentSource, /propForAsset\.mirrorX/);
  assert.match(journeyComponentSource, /getGeneratedStoryPropRenderProp/);
});

test('journey prop editor exposes environmental blending controls for selected props', () => {
  assert.match(journeyComponentSource, /propForAsset\.shadowOpacity/);
  assert.match(journeyComponentSource, /propForAsset\.sandOverlapHeight/);
  assert.match(journeyComponentSource, /propForAsset\.sandMoundWidth/);
  assert.match(journeyComponentSource, /propForAsset\.groundPebbles/);
  assert.match(journeyComponentSource, /propForAsset\.colorGradeFilter/);
  assert.match(journeyComponentSource, /<span>Shadow opacity<\/span>[\s\S]*?updateSelectedPropEditorNumberField\('shadowOpacity'/);
  assert.match(journeyComponentSource, /<span>Shadow width<\/span>[\s\S]*?updateSelectedPropEditorNumberField\('shadowWidth'/);
  assert.match(journeyComponentSource, /<span>Sand overlap<\/span>[\s\S]*?updateSelectedPropEditorNumberField\('sandOverlapHeight'/);
  assert.match(journeyComponentSource, /<span>Sand mound width<\/span>[\s\S]*?updateSelectedPropEditorNumberField\('sandMoundWidth'/);
  assert.match(journeyComponentSource, /<span>Ground pebbles<\/span>[\s\S]*?updateSelectedPropEditorNumberField\('groundPebbles'/);
  assert.match(journeyComponentSource, /renderEditorSectionHeader\('prop-colour', 'Colour & Light'\)[\s\S]*?updateSelectedPropEditorField\('colorGradeFilter'/);
});

test('journey prop editor exposes generated structure ground-contact controls', () => {
  assert.match(journeyComponentSource, /groundContactLayer:\s*Array\.isArray\(prop\.groundContactLayer\)/);
  assert.match(journeyComponentSource, /updateSelectedPropGroundContactLayer/);
  assert.match(journeyComponentSource, /selectedProp\.category === 'Structure'[\s\S]*?Ground contact layers/);
  assert.match(journeyComponentSource, /Contact \{index \+ 1\}/);
  assert.match(journeyComponentSource, /<span>Asset key<\/span>[\s\S]*?updateSelectedPropGroundContactLayer\(index,\s*\{ assetKey:/);
  assert.match(journeyComponentSource, /<span>X ratio<\/span>[\s\S]*?updateSelectedPropGroundContactLayer\(index,\s*\{ xRatio:/);
  assert.match(journeyComponentSource, /<span>Width ratio<\/span>[\s\S]*?updateSelectedPropGroundContactLayer\(index,\s*\{ widthRatio:/);
  assert.match(journeyComponentSource, /<span>Y offset<\/span>[\s\S]*?updateSelectedPropGroundContactLayer\(index,\s*\{ yOffset:/);
  assert.match(journeyComponentSource, /<span>Rotation<\/span>[\s\S]*?updateSelectedPropGroundContactLayer\(index,\s*\{ rotation:/);
  assert.match(journeyComponentSource, /<span>Alpha<\/span>[\s\S]*?updateSelectedPropGroundContactLayer\(index,\s*\{ alpha:/);
  assert.match(journeyComponentSource, /<span>Mirror<\/span>[\s\S]*?updateSelectedPropGroundContactLayer\(index,\s*\{ mirrorX:/);
  assert.match(journeyComponentSource, /<span>Filter<\/span>[\s\S]*?updateSelectedPropGroundContactLayer\(index,\s*\{ filter:/);
});

test('journey prop editor overlay does not wash selected assets', () => {
  const overlayStart = useJourneyRendererSource.indexOf('export function drawPropPlacementEditorOverlayFrame');
  const drawStart = useJourneyRendererSource.indexOf('export function useJourneyRenderer', overlayStart);
  assert.notEqual(overlayStart, -1);
  assert.notEqual(drawStart, -1);
  const overlaySource = useJourneyRendererSource.slice(overlayStart, drawStart);
  const propOverlaySource = overlaySource.slice(
    overlaySource.indexOf('getRenderableStoryProps(current).forEach'),
    overlaySource.indexOf('const selectedProp = getPropEditorSelectedProp(current);'),
  );
  const selectedPropBranchSource = propOverlaySource.slice(
    propOverlaySource.indexOf('if (selected) {'),
    propOverlaySource.indexOf('} else {'),
  );

  assert.match(overlaySource, /drawEditorSelectionCorners/);
  assert.match(overlaySource, /drawEditorSelectionLabel/);
  assert.match(propOverlaySource, /if \(selected\) \{[\s\S]*?drawEditorSelectionCorners/);
  assert.doesNotMatch(selectedPropBranchSource, /fillRect/);
  assert.doesNotMatch(propOverlaySource, /ctx\.fillRect\(bounds\.x, bounds\.y, bounds\.width, bounds\.height\)/);
  assert.doesNotMatch(propOverlaySource, /selected\s*\?\s*'rgba\([^']+0\.1[2-9]/);
});

test('journey editor platform overlays follow the vertical camera during climb sections', () => {
  const platformBoundsSource = getComponentFunctionSource('getPlatformEditorBounds');
  assert.match(platformBoundsSource, /getPlatformEditorBounds = useCallback\(\(platform,\s*cameraX,\s*current\)/);
  assert.match(platformBoundsSource, /secretVerticalCameraOffset/);
  assert.match(platformBoundsSource, /!isInteriorChamberScene\(current\)/);
  assert.match(platformBoundsSource, /platform\.y \+ verticalOffset/);
  assert.match(journeyComponentSource, /getPlatformEditorBounds\(platform,\s*cameraX,\s*current\)/);
  assert.match(journeyComponentSource, /getPlatformEditorBounds\(selectedPlatform,\s*cameraX,\s*current\)/);
  assert.match(journeyComponentSource, /kind:\s*'platform'[\s\S]*?offsetY:\s*pointer\.worldY - selectedPlatform\.y/);
  assert.match(journeyComponentSource, /editor\.dragging\.kind === 'platform'[\s\S]*?const rawY = pointer\.worldY - editor\.dragging\.offsetY/);
});

test('journey editor toggle preserves the current camera view', () => {
  const toggleStart = journeyComponentSource.indexOf("if (event.code === 'KeyE' && event.shiftKey");
  assert.notEqual(toggleStart, -1, 'Shift+E editor toggle should exist');
  const toggleEnd = journeyComponentSource.indexOf('if (!editor.enabled) return;', toggleStart);
  assert.notEqual(toggleEnd, -1, 'Shift+E editor toggle should end before editor-only shortcuts');
  const toggleSource = journeyComponentSource.slice(toggleStart, toggleEnd);

  assert.match(toggleSource, /editor\.enabled = !editor\.enabled;/);
  assert.match(toggleSource, /applyDefaultEditorLocks\(stateRef\.current\)/);
  assert.doesNotMatch(toggleSource, /cameraX\s*=/, 'opening the editor should not jump the camera away from the painted game view');
  assert.match(
    journeyComponentSource,
    /selectEditorPropFromOutliner[\s\S]*?current\.cameraX = nextCameraX/,
    'the outliner may still recenter when deliberately choosing an off-screen item',
  );
});

test('journey editor exposes floor platforms without blocking prop selection', () => {
  const platforms = extractExportedArray('PLATFORMS');
  [
    'desert-entry-floor-opening',
    'desert-entry-floor-after-ravine',
    'temple-floor',
    'catacomb-path-floor',
    'escape-road-floor',
    'dig-site-rise-floor',
  ].forEach((platformId) => {
    assert.match(platforms, new RegExp(`id:\\s*'${platformId}'[\\s\\S]*?y:\\s*GROUND_Y`));
  });
  assert.match(journeyComponentSource, /const isJourneyFloorPlatform = \(platform = \{\}\) =>/);
  assert.match(journeyComponentSource, /const selectedFallbackFloor = editor\.floorPickMode \|\| selectedHazard \|\| selectedLair \|\| selectedCheckpoint \|\| selectedArch \|\| selectedSolidPlatform \|\| selectedProp[\s\S]{0,180}findEditablePlatformAt\(pointer\.screenX, pointer\.screenY, \{ floorOnly: true \}\);/);
  assert.match(journeyComponentSource, /category: isJourneyBlockerPlatform\(platform\) \? 'Blocker' : isJourneyFloorPlatform\(platform\) \? 'Floor' : 'Platform'/);
  assert.match(journeyComponentSource, /Nothing selected — click an item on the canvas, or open the Palette to place one\./);
});

test('journey editor movement blockers stop side walking without becoming ledges', () => {
  assert.match(journeyUtilsSource, /key:\s*'platform:blocker'/);
  assert.match(journeyUtilsSource, /collision:\s*'blocker'/);
  assert.match(journeyUtilsSource, /if \(platform\?\.collision === 'blocker'\) return false;/);
  assert.match(journeyComponentSource, /const isJourneyBlockerPlatform = \(platform = \{\}\) => platform\.collision === 'blocker';/);
  assert.match(journeyComponentSource, /resolveJourneyBlockerPlatformCollision\(player, previousPlayer, blocker\)/);
  assert.match(journeyComponentSource, /\.filter\(isJourneyBlockerPlatform\)/);
  assert.match(journeyComponentSource, /<option value="blocker">Blocker<\/option>/);
});

test('journey editor can force-pick floor platforms for moving collision floors', () => {
  assert.match(journeyComponentSource, /floorPickMode:\s*false/);
  assert.match(journeyComponentSource, /floorPickMode:\s*editor\.floorPickMode/);
  assert.match(journeyComponentSource, /propPlacementEditorRef\.current\.floorPickMode = !propPlacementEditorRef\.current\.floorPickMode/);
  assert.match(journeyComponentSource, /floorPickMode \? '✓ Floors' : 'Floors'/);
  assert.match(journeyComponentSource, /const selectedForcedFloor = editor\.floorPickMode[\s\S]{0,180}findEditablePlatformAt\(pointer\.screenX, pointer\.screenY, \{ floorOnly: true \}\)/);
  assert.match(journeyComponentSource, /const selectedHazard = selectedForcedFloor \? null : findEditableHazardAt\(pointer\.screenX, pointer\.screenY\);/);
  assert.match(journeyComponentSource, /const selectedSolidPlatform = selectedHazard \|\| selectedLair \|\| selectedCheckpoint \|\| selectedArch \|\| selectedForcedFloor[\s\S]{0,180}findEditablePlatformAt\(pointer\.screenX, pointer\.screenY, \{ includeFloors: false \}\);/);
  assert.match(journeyComponentSource, /const selectedFallbackFloor = editor\.floorPickMode \|\| selectedHazard \|\| selectedLair \|\| selectedCheckpoint \|\| selectedArch \|\| selectedSolidPlatform \|\| selectedProp[\s\S]{0,180}findEditablePlatformAt\(pointer\.screenX, pointer\.screenY, \{ floorOnly: true \}\);/);
  assert.match(journeyComponentSource, /const selectedPlatform = selectedForcedFloor \|\| selectedSolidPlatform \|\| selectedFallbackFloor;/);
});

test('journey editor prop palette exposes premium modular floor kit inserts', () => {
  const palette = createJourneyPropPalette([], lostSitePropRegistry);
  const kitEntries = new Map(
    palette
      .filter(item => item.category === 'Premium Floor Kit')
      .map(item => [item.atmosphereAssetKey, item]),
  );

  [
    ['loose_floor_tiles', 128, 34],
    ['cracked_floor_tile', 112, 30],
    ['pressure_plate', 126, 28],
    ['suspicious_sand_patch', 132, 28],
    ['scarab_carving', 72, 34],
  ].forEach(([assetKey, width, height]) => {
    const item = kitEntries.get(assetKey);
    assert.ok(item, `${assetKey} should be available as a premium floor kit insert`);
    assert.equal(item.template.placementPreset, 'desertEntryGroundedRuin');
    assert.equal(item.template.depth, 'grounded');
    assert.equal(item.template.width, width);
    assert.equal(item.template.height, height);
    assert.equal(item.template.layer, 'route-edge');
  });
  assert.match(journeyComponentSource, /const getStoryPropExplicitGroundY = \(propSize = \{\}\) =>/);
  assert.match(journeyComponentSource, /const getStoryPropAnchorY = \(prop, propSize, shouldGroundLock\) =>/);
  assert.match(journeyComponentSource, /return explicitGroundY \+ yOffset/);
  assert.match(journeyComponentSource, /const getGroundAwareStoryPropEditorEdit = useCallback\(\(prop, edit = \{\}\) =>/);
  assert.match(journeyComponentSource, /nextEdit\.yOffset = Math\.round\(edit\.y - explicitGroundY\)/);
  assert.match(journeyComponentSource, /Object\.assign\(nextProp, getGroundAwareStoryPropEditorEdit\(nextProp, \{ y: nextProp\.y \}\)\)/);
});

test('desert entry buried causeway visual is narrower than the floor collision band', () => {
  assert.match(journeyComponentSource, /DESERT_ENTRY_CAUSEWAY_DRAW_HEIGHT = 64/);
  assert.match(journeyComponentSource, /DESERT_ENTRY_CAUSEWAY_DRAW_Y_OFFSET = -28/);
  assert.match(journeyComponentSource, /desertEntryCausewayVisualMode:\s*'narrow-premium-causeway-with-modular-floor-kit'/);
  assert.doesNotMatch(journeyComponentSource, /const drawHeight = 96;\s*const drawY = platform\.y - 42;/);
});

test('journey editor exposes arch gates and checkpoints through canonical placement data', () => {
  assert.match(journeyUtilsSource, /applyJourneyRouteGatePlacementEdit/);
  assert.match(journeyUtilsSource, /applyJourneyRouteGateDoorwayPlacementEdit/);
  assert.match(journeyUtilsSource, /applyJourneyCheckpointPlacementEdit/);
  assert.match(journeyComponentSource, /findEditableArchAt/);
  assert.match(journeyComponentSource, /findEditableCheckpointAt/);
  assert.match(journeyComponentSource, /selectedArch[\s\S]*?<span>Width<\/span>[\s\S]*?updateSelectedArchEditorTransform\(\{ width:/);
  assert.match(journeyComponentSource, /selectedCheckpoint[\s\S]*?<span>X<\/span>[\s\S]*?updateSelectedCheckpointEditorTransform\(\{ x:/);
  assert.match(journeyComponentSource, /routeGates:\s*roomRouteGates/);
  assert.match(journeyComponentSource, /routeGateDoorways:\s*roomRouteGateDoorways/);
  assert.match(journeyComponentSource, /checkpoints:\s*roomCheckpoints/);
});

test('journey editor exposes the Scarab Queen lair through mini-boss placement data', () => {
  assert.match(journeyUtilsSource, /applyJourneyMiniBossPlacementEdit/);
  assert.match(journeyUtilsSource, /lairWidth/);
  assert.match(journeyComponentSource, /findEditableScarabLairAt/);
  assert.match(journeyComponentSource, /getScarabQueenLairPlacement/);
  assert.match(journeyComponentSource, /selectedLair[\s\S]*?<span>Width<\/span>[\s\S]*?updateSelectedLairEditorTransform\(\{ lairWidth:/);
  assert.match(journeyComponentSource, /miniBosses:\s*roomMiniBosses/);
  assert.match(journeyComponentSource, /drawScarabQueenLairOpeningProp\(ctx, lairPlacement\.x/);
});

test('journey placement editor polish keeps controls usable and scoped to editor input', () => {
  assert.match(journeyComponentSource, /const isJourneyEditorFormTarget = \(target\) =>/);
  assert.match(journeyComponentSource, /if \(isJourneyEditorFormTarget\(event\.target\)\) return;/);
  assert.match(journeyComponentSource, /if \(isJourneyEditorFormTarget\(e\.target\)\) return;/);
  assert.match(journeyComponentSource, /journey-prop-editor-actions/);
  assert.match(journeyComponentSource, />\s*Build export\s*</);
  assert.match(journeyComponentSource, /paletteOpen \? '✓ Palette' : 'Palette'/);
  assert.match(journeyComponentSource, /gridSnap \? '✓ Grid' : 'Grid'/);
  assert.match(journeyComponentSource, /showTrapTriggers \? '✓ Triggers' : 'Triggers'/);
  assert.match(journeyComponentSource, /lockedItems:\s*new Set\(\)/);
  assert.match(journeyComponentSource, /const getSelectedEditorLockKey = useCallback/);
  assert.match(journeyComponentSource, /const toggleSelectedEditorLock = useCallback/);
  assert.match(journeyComponentSource, /journey-prop-editor-selection-lock/);
  assert.match(journeyComponentSource, /Locked — click to unlock/);
  assert.match(journeyComponentSource, /if \(isEditorLockKeyLocked\(selectedLockKey\)\)[\s\S]*?editor\.dragging = null/);
  assert.match(journeyComponentSource, /if \(isEditorEntityLocked\('prop', selectedProp\.id\)\) return;/);
  assert.match(journeyComponentSource, /if \(isEditorEntityLocked\('platform', platformId\)\) return;/);
  assert.match(journeyComponentSource, /<strong>Placement export<\/strong>/);
  assert.match(journeyComponentSource, /aria-label="Placement editor export JSON"/);
  assert.match(indexCssSource, /\.journey-prop-editor-panel\s*\{[^}]*left:\s*0\.72rem;/);
  assert.match(indexCssSource, /\.journey-prop-editor-panel\s*\{[^}]*transform:\s*none;/);
  assert.match(indexCssSource, /\.journey-prop-editor-panel\s*\{[^}]*max-height:\s*min\(39rem, calc\(100% - 1\.24rem\)\);[^}]*overflow:\s*auto;/);
  assert.match(indexCssSource, /\.journey-prop-editor-actions/);
});

test('journey editor treats generated buildings as structure props with image previews', () => {
  assert.match(journeyComponentSource, /GENERATED_STORY_PROP_PREVIEW_SOURCES[\s\S]*?'generated-scribe-chamber-doorway'[\s\S]*?SCRIBE_CHAMBER_EXTERIOR_SRC/);
  assert.match(journeyComponentSource, /const isGeneratedStoryStructureProp = \(prop = \{\}\) => GENERATED_STORY_PROP_TYPES\.has\(prop\.type\)/);
  assert.match(journeyComponentSource, /category: isGeneratedStoryStructureProp\(prop\) \? 'Structure' : 'Prop'/);
  assert.match(journeyComponentSource, /<span>\{propEditorUi\.selectedProp\.category\}<\/span><strong>\{propEditorUi\.selectedProp\.id\}<\/strong>/);
  assert.match(journeyComponentSource, /Nothing selected — click an item on the canvas, or open the Palette to place one\./);
  assert.match(journeyComponentSource, /backgroundImage: `url\(\$\{import\.meta\.env\.BASE_URL\}\$\{generatedPreview\.src\}\)`/);
});

test('opening cinematic starts on the main expedition path and has a styled dramatic overlay', () => {
  assert.match(journeyComponentSource, /OPENING_CINEMATIC_DURATION = 54/);
  assert.match(journeyComponentSource, /OPENING_CINEMATIC_ENABLED = true/);
  assert.match(journeyComponentSource, /OPENING_CINEMATIC_LINES = \[/);
  assert.match(journeyComponentSource, /speaker:\s*'Anubis'[\s\S]*?voice:\s*'guardian'/);
  assert.match(journeyComponentSource, /speaker:\s*'Asha'[\s\S]*?voice:\s*'asha'/);
  assert.match(journeyComponentSource, /startOpeningCinematic/);
  assert.match(journeyComponentSource, /startJourneyWithoutOpeningScene/);
  assert.match(journeyComponentSource, /OPENING_CINEMATIC_ENABLED \? \(\) => startOpeningCinematic/);
  assert.match(journeyComponentSource, /openingCinematicState:\s*current\.openingCinematic/);
  assert.match(journeyComponentSource, /window\.speechSynthesis/);
  assert.match(journeyComponentSource, /drawOpeningCinematic/);
  assert.match(journeyComponentSource, /OPENING_CINEMATIC_SPELL_IMPACT_AT = 49\.4/);
  assert.match(journeyComponentSource, /spellImpactTriggered/);
  assert.match(journeyComponentSource, /shieldShattered/);
  assert.match(journeyComponentSource, /current\.player\.x = 44/);
  assert.match(journeyComponentSource, /opening-cinematic-lightning/);
  assert.match(journeyComponentSource, /opening-cinematic-impact/);
  assert.match(journeyComponentSource, /opening-cinematic-shield/);
  assert.match(journeyComponentSource, /opening-cinematic-shield-aura/);
  assert.match(journeyComponentSource, /opening-cinematic-shield-shards/);
  assert.match(journeyComponentSource, /opening-cinematic-banishment-ring/);
  assert.match(journeyComponentSource, /opening-cinematic-shockwave/);
  assert.match(journeyComponentSource, /asha-opening-reference-cutscene\.png/);
  assert.match(journeyComponentSource, /The Gate Refuses/);
  assert.match(journeyComponentSource, /This is not the Field of Reeds\. It's too broken\./);
  assert.match(journeyComponentSource, /A mortal stands beyond my seal\./);
  assert.match(journeyComponentSource, /There is one road beyond life\./);
  assert.match(journeyComponentSource, /Your kind broke tombs\./);
  assert.match(journeyComponentSource, /Forward is judgement\./);
  assert.doesNotMatch(journeyComponentSource, /The past is not treasure to own/);
  assert.doesNotMatch(journeyComponentSource, /You did not come to take/);
  assert.match(journeyComponentSource, /opening-cinematic-memory-runes/);
  assert.match(indexCssSource, /\.opening-cinematic-overlay\s*\{/);
  assert.match(indexCssSource, /\.opening-cinematic-backdrop\s*\{/);
  assert.match(indexCssSource, /\.opening-cinematic-anubis\s*\{/);
  assert.match(indexCssSource, /\.opening-cinematic-dialogue\.is-guardian\s*\{/);
  assert.match(indexCssSource, /@keyframes openingAnubisPresence/);
  assert.doesNotMatch(journeyComponentSource, /<video|opening-cinematic-video|createOpeningMovieMode/);
});

test('Lost Site arrival dialogue sells confusion, mortal-crossing shock, greed judgement, and forced path forward without early memory exposition', () => {
  const openingStart = journeyComponentSource.indexOf('const OPENING_CINEMATIC_LINES = [');
  const openingEnd = journeyComponentSource.indexOf('// Rome opening cinematic');
  const openingLines = journeyComponentSource.slice(openingStart, openingEnd);

  assert.notEqual(openingStart, -1);
  assert.notEqual(openingEnd, -1);
  // Asha reads the broken setting through her knowledge of the afterlife journey
  assert.match(openingLines, /This is not the Field of Reeds\. It's too broken\./);
  assert.match(openingLines, /But it's shaped like the journey\./);
  // Anubis is shocked a living mortal crossed his seal; death is the only road beyond life
  assert.match(openingLines, /A mortal stands beyond my seal\./);
  assert.match(openingLines, /There is one road beyond life\./);
  // Anubis judges humanity as greedy trespassers and assumes the same of Asha
  assert.match(openingLines, /Your kind broke tombs\./);
  assert.match(openingLines, /Your kind always has words for trespass\./);
  // The way back is gone and the path forward means judgement
  assert.match(openingLines, /The way back is gone\./);
  assert.match(openingLines, /Forward is judgement\./);
  assert.match(openingLines, /Then I keep moving\./);
  assert.doesNotMatch(openingLines, /memory to protect|It was not treasure they stole|chosen|destiny/i);
  assert.doesNotMatch(openingLines, /no longer obeys|taught it fear/i);
});

test('opening transport and arrival use dedicated scarab, threshold, Anubis, and Lost Site SFX cues', () => {
  assert.match(
    expeditionModeSource,
    /cinematicStep\.id === 'scarab-floor-carving'[\s\S]*?audioControls\.playExpeditionSfx\?\.\('scarabTouchWhisper'/,
  );
  assert.match(
    expeditionModeSource,
    /finalCinematicStep[\s\S]*?audioControls\.playExpeditionSfx\?\.\('thresholdRealityTear'/,
  );
  assert.match(
    journeyComponentSource,
    /startOpeningCinematic[\s\S]*?audioControls\?\.playExpeditionSfx\?\.\('anubisPresenceStinger'/,
  );
  assert.match(
    journeyComponentSource,
    /spellImpactTriggered[\s\S]*?audioControls\?\.playExpeditionSfx\?\.\('thresholdRealityTear'/,
  );
  assert.match(
    journeyComponentSource,
    /opening-arrival-aftershock[\s\S]*?audioControls\?\.playExpeditionSfx\?\.\('lostSiteAirShift'/,
  );
});

test('opening arrival aftermath confirms Asha is trapped, watched, and must move forward into judgement', () => {
  assert.match(journeyComponentSource, /const OPENING_ARRIVAL_AFTERSHOCK_NOTICE = 'The way back is gone\. Anubis is still watching\. The only path is forward, into judgement\.'/);
  assert.match(journeyComponentSource, /current\.notice = OPENING_ARRIVAL_AFTERSHOCK_NOTICE/);
  assert.match(journeyComponentSource, /id:\s*'opening-arrival-aftershock'/);
  assert.match(journeyComponentSource, /name:\s*'Asha'/);
  assert.match(journeyComponentSource, /message:\s*OPENING_ARRIVAL_AFTERSHOCK_NOTICE/);
  assert.match(journeyComponentSource, /skipOpeningCinematic[\s\S]*?OPENING_ARRIVAL_AFTERSHOCK_NOTICE/);
  assert.doesNotMatch(journeyComponentSource, /opening-arrival-aftershock[\s\S]{0,400}(chosen|destiny|memory to protect|It was not treasure they stole)/i);
});

test('hidden routes are optional and never required for main progression', () => {
  const hiddenRoutes = extractExportedArray('HIDDEN_ROUTES');

  assert.ok((hiddenRoutes.match(/id:/g) || []).length >= 4);
  assert.match(hiddenRoutes, /civilisation:\s*'Ancient Egypt'/);
  assert.match(hiddenRoutes, /civilisation:\s*'Ancient China'/);
  assert.match(hiddenRoutes, /optional:\s*true/);
  assert.match(hiddenRoutes, /rewardHint:/);
  assert.match(hiddenRoutes, /discoveryMessage:/);
});

test('hidden routes define visible upgrade-gated exploration types', () => {
  const hiddenRoutes = extractExportedArray('HIDDEN_ROUTES');

  ['high ledge', 'cracked wall', 'unstable bridge', 'blocked excavation tunnel', 'narrow crawl route'].forEach((gateType) => {
    assert.match(hiddenRoutes, new RegExp(`gateType:\\s*'${gateType}'`));
  });
  ['rope-launcher', 'survey-goggles', 'excavation-hammer', 'climbing-gloves'].forEach((upgradeId) => {
    assert.match(hiddenRoutes, new RegExp(`requiredUpgradeId:\\s*'${upgradeId}'`));
  });
  assert.match(hiddenRoutes, /lockedMessage:/);
  assert.match(hiddenRoutes, /teaseVisible:\s*true/);
  assert.match(hiddenRoutes, /rewardSummary:/);
});

test('secret collectibles support Egypt and China discovery sets', () => {
  const secretCollectibles = extractExportedArray('SECRET_COLLECTIBLES');

  assert.ok((secretCollectibles.match(/id:/g) || []).length >= 6);
  assert.match(secretCollectibles, /setId:\s*'egypt-secrets'/);
  assert.match(secretCollectibles, /setId:\s*'china-secrets'/);
  assert.match(secretCollectibles, /routeId:/);
  assert.match(secretCollectibles, /discoveryMessage:/);
  assert.match(secretCollectibles, /x:\s*X\(/);
  assert.match(secretCollectibles, /y:\s*JY\(/);
});

test('sacred room restoration fragments use secret collectibles without becoming route-gate currency', () => {
  const hiddenRoutes = extractExportedArray('HIDDEN_ROUTES');
  const secretCollectibles = extractExportedArray('SECRET_COLLECTIBLES');
  const collectibleAtlas = JSON.parse(readFileSync(new URL('../../../public/assets/expedition/collectibles/journey-collectibles-pack.json', import.meta.url), 'utf8'));
  const storyProps = extractExportedArray('STORY_PROPS');
  const routeGates = extractExportedArray('ROUTE_GATES');
  const relicShardLayout = source.slice(source.indexOf('const RELIC_SHARD_LAYOUT = ['), source.indexOf('export const RELIC_SHARDS'));
  const restorationSpriteKeys = [
    'linenMemoryFragment',
    'resinRiteFragment',
    'canopicNameFragment',
    'scarabWingFragment',
    'muralFaienceFragment',
    'muralPlasterFragment',
    'inkNameFragment',
    'witnessLineFragment',
    'royalRecordFragment',
  ];

  [
    {
      routeId: 'mummification-chamber-route',
      sceneId: 'mummification-chamber',
      restorationSetId: 'mummification-body-self',
      finalId: 'egypt-mummification-body-fragment-3',
      restoresStoryFlag: 'mummification-body-restored',
      stateFlag: 'mummificationChamberRestored',
      propId: 'mummification-body-restoration-cue',
    },
    {
      routeId: 'desert-upper-survey-route',
      sceneId: 'forgotten-mural-chamber',
      restorationSetId: 'forgotten-mural-seal',
      finalId: 'egypt-scarab-fragment-3',
      restoresStoryFlag: 'forgotten-mural-restored',
      stateFlag: 'forgottenMuralChamberRestored',
      propId: 'forgotten-mural-image-restoration-cue',
    },
    {
      routeId: 'scribe-locked-chamber-route',
      sceneId: 'scribe-locked-chamber',
      restorationSetId: 'scribe-name-record',
      finalId: 'egypt-scribe-name-fragment-3',
      restoresStoryFlag: 'scribe-name-restored',
      stateFlag: 'scribeChamberRecordRestored',
      propId: 'scribe-name-restoration-cue',
    },
  ].forEach(({ routeId, sceneId, restorationSetId, finalId, restoresStoryFlag, stateFlag, propId }) => {
    const route = getDataRowById(hiddenRoutes, routeId);
    assert.match(route, /optional:\s*true/);
    assert.equal(
      (secretCollectibles.match(new RegExp(`restorationSetId:\\s*'${restorationSetId}'`, 'g')) || []).length,
      3,
      `${restorationSetId} should define exactly 3 secret collectible fragments`,
    );

    const finalFragment = getDataRowById(secretCollectibles, finalId);
    assert.match(finalFragment, new RegExp(`routeId:\\s*'${routeId}'`));
    assert.match(finalFragment, new RegExp(`sceneId:\\s*'${sceneId}'`));
    assert.match(finalFragment, new RegExp(`restoresStoryFlag:\\s*'${restoresStoryFlag}'`));
    assert.match(finalFragment, /restoreMessage:/);
    assert.match(finalFragment, /anubisReaction:/);

    assert.match(journeyUtilsSource, new RegExp(`${stateFlag}:\\s*false`));
    const prop = getDataRowById(storyProps, propId);
    assert.match(prop, new RegExp(`sceneId:\\s*'${sceneId}'`), `${propId} should belong to ${sceneId}`);
  });

  restorationSpriteKeys.forEach((key) => {
    assert.match(secretCollectibles, new RegExp(`spriteKey:\\s*'${key}'`));
    assert.match(journeyCollectibleSpritesSource, new RegExp(`'${key}'`));
    assert.ok(collectibleAtlas.regions[key], `${key} should exist in the collectible atlas`);
  });
  assert.match(journeyComponentSource, /key:\s*secret\.spriteKey\s*\|\|\s*'loreTablet'/);
  assert.doesNotMatch(relicShardLayout, /sceneId:\s*'mummification-chamber'|sceneId:\s*'forgotten-mural-chamber'|sceneId:\s*'scribe-locked-chamber'/);
  assert.doesNotMatch(routeGates, /restoredFragments|restoredFragment|restorationSetId|anubisTrust|trustMeter/);
  assert.doesNotMatch(journeyComponentSource, /anubisTrust|trustMeter/);
  assert.match(journeyComponentSource, /const ROOM_RESTORATION_SETS = \{/);
  assert.match(journeyComponentSource, /const getRoomRestorationStatus = \(secret, current\) =>/);
  assert.match(journeyComponentSource, /const getSacredRoomRestorationEvidence = \(current\) =>/);
  assert.match(journeyComponentSource, /roomRestored:\s*Boolean\(!config\.opensMuralPuzzle && fragmentsRecovered && !alreadyRestored\)/);
  assert.doesNotMatch(journeyComponentSource, /finalFragmentCollected/);
});

test('room restoration remains story evidence rather than mandatory route payment', () => {
  const routeGates = extractExportedArray('ROUTE_GATES');

  [
    'mummificationChamberRestored',
    'forgottenMuralChamberRestored',
    'scribeChamberRecordRestored',
  ].forEach((stateFlag) => {
    assert.doesNotMatch(routeGates, new RegExp(stateFlag));
  });

  const shardCollectionIndex = journeyComponentSource.indexOf('current.relicShardCount += 1');
  assert.notEqual(shardCollectionIndex, -1, 'route shard collection should increment relicShardCount');
  const shardCollectionLoopStart = journeyComponentSource.lastIndexOf('RELIC_SHARDS.forEach(shard => {', shardCollectionIndex);
  const shardCollectionLoopEnd = journeyComponentSource.indexOf('getActiveSecretCollectibles().forEach', shardCollectionIndex);
  assert.notEqual(shardCollectionLoopStart, -1, 'route shard collection loop should start before relicShardCount increment');
  assert.notEqual(shardCollectionLoopEnd, -1, 'secret collectible loop should follow route shard collection loop');
  assert.ok(shardCollectionLoopStart < shardCollectionIndex, 'route shard loop start should precede relicShardCount increment');
  assert.ok(shardCollectionIndex < shardCollectionLoopEnd, 'route shard loop should end before secret collectible loop begins');
  const relicShardCollectionLoop = journeyComponentSource.slice(shardCollectionLoopStart, shardCollectionLoopEnd);
  assert.match(relicShardCollectionLoop, /RELIC_SHARDS\.forEach\(shard => \{/);
  assert.match(relicShardCollectionLoop, /if \(inInteriorChamberScene\) return;/);
  assert.match(relicShardCollectionLoop, /current\.relicShardCount \+= 1/);
  assert.match(journeyComponentSource, /getActiveSecretCollectibles\(\)\.forEach/);
  assert.match(journeyComponentSource, /getRoomRestorationStatus\(secret, current\)/);
});

test('Journey HUD surfaces sacred room restoration as Anubis judgement evidence', () => {
  const routeGates = extractExportedArray('ROUTE_GATES');

  assert.match(journeyComponentSource, /const SACRED_ROOM_EVIDENCE_LABELS = \[/);
  assert.match(journeyComponentSource, /label:\s*'Body'[\s\S]*?setId:\s*'mummification-body-self'/);
  assert.match(journeyComponentSource, /label:\s*'Image'[\s\S]*?setId:\s*'forgotten-mural-seal'/);
  assert.match(journeyComponentSource, /label:\s*'Name'[\s\S]*?setId:\s*'scribe-name-record'/);
  assert.match(journeyComponentSource, /const sacredRoomEvidenceRows = getSacredRoomEvidenceRows\(gameState\)/);
  assert.match(journeyComponentSource, /const restoredSacredRoomCount = sacredRoomEvidenceRows\.filter\(row => row\.restored\)\.length/);
  assert.match(journeyComponentSource, /Sacred room evidence/);
  assert.match(journeyComponentSource, /Anubis judges restored evidence, not promises\./);
  assert.match(journeyComponentSource, /journey-floating-hud-restoration/);
  assert.match(journeyComponentSource, /restoredSacredRoomCount\}\/\{sacredRoomEvidenceRows\.length\}/);
  assert.doesNotMatch(routeGates, /mummification-body-self|forgotten-mural-seal|scribe-name-record|mummificationChamberRestored|forgottenMuralChamberRestored|scribeChamberRecordRestored/);
  assert.doesNotMatch(journeyComponentSource, /trustMeter|anubisTrust/);
});

test('first Egypt secret route rewards curiosity without changing main progression', () => {
  const hiddenRoutes = extractExportedArray('HIDDEN_ROUTES');
  const secretCollectibles = extractExportedArray('SECRET_COLLECTIBLES');
  const storyProps = extractExportedArray('STORY_PROPS');
  const events = extractExportedArray('ENVIRONMENT_EVENTS');
  const routeGates = extractExportedArray('ROUTE_GATES');
  const platforms = extractExportedArray('PLATFORMS');
  const shards = source.slice(source.indexOf('const RELIC_SHARD_LAYOUT = ['), source.indexOf('export const RELIC_SHARDS'));
  const firstSecretRoute = getDataRowById(hiddenRoutes, 'desert-upper-survey-route');
  const scarabFragment = getDataRowById(secretCollectibles, 'egypt-scarab-fragment-1');
  const scarabFragmentTwo = getDataRowById(secretCollectibles, 'egypt-scarab-fragment-2');
  const scarabFragmentThree = getDataRowById(secretCollectibles, 'egypt-scarab-fragment-3');

  assert.match(firstSecretRoute, /name:\s*'Forgotten Mural Alcove'/);
  assert.match(firstSecretRoute, /optional:\s*true/);
  assert.match(firstSecretRoute, /sectionId:\s*'desert-entry'/);
  assert.match(firstSecretRoute, /y:\s*JY\(-154\)/);
  assert.match(firstSecretRoute, /rewardHint:\s*'A shadow moves above the ruins\. A blue scarab glow vanishes into the upper doorway\.'/);
  assert.match(firstSecretRoute, /discoveryMessage:\s*'Forgotten Mural Chamber discovered\. The warning mural has been damaged\.'/);
  assert.match(firstSecretRoute, /gateType:\s*'faded mural seam'/);
  assert.match(firstSecretRoute, /teaseVisible:\s*true/);
  assert.match(firstSecretRoute, /storySummary:\s*'Broken pieces of a scarab seal lie across the floor\. Someone tried to erase this warning\.'/);
  assert.match(firstSecretRoute, /rewardSummary:\s*'Three scarab seal fragments restored, hidden shard cache, and field journal clue'/);
  assert.doesNotMatch(firstSecretRoute, /requiredUpgradeId:/);

  assert.match(scarabFragment, /routeId:\s*'desert-upper-survey-route'/);
  assert.match(scarabFragment, /name:\s*'Broken Scarab Fragment I'/);
  assert.match(scarabFragment, /restorationSetId:\s*'forgotten-mural-seal'/);
  assert.match(scarabFragmentTwo, /name:\s*'Broken Scarab Fragment II'/);
  assert.match(scarabFragmentTwo, /restorationSetId:\s*'forgotten-mural-seal'/);
  assert.match(scarabFragmentThree, /name:\s*'Broken Scarab Fragment III'/);
  assert.match(scarabFragmentThree, /restorationSetId:\s*'forgotten-mural-seal'/);
  assert.match(scarabFragmentThree, /restoresStoryFlag:\s*'forgotten-mural-restored'/);
  assert.match(scarabFragmentThree, /restoreMessage:\s*'The scarab settles into place\. Something opens behind the wall\.'/);;
  assert.match(scarabFragmentThree, /anubisReaction:/);
  assert.match(scarabFragmentThree, /discoveryMessage:/);
  assert.equal((secretCollectibles.match(/restorationSetId:\s*'forgotten-mural-seal'/g) || []).length, 3);
  assert.match(platforms, /id:\s*'forgotten-mural-carved-wall-ledge'[\s\S]*?carved wall ledge in hidden priest passage/);
  assert.match(platforms, /id:\s*'forgotten-mural-alcove-floor'[\s\S]*?y:\s*JY\(318\)[\s\S]*?full Forgotten Mural Chamber floor/);
  assert.match(platforms, /id:\s*'forgotten-mural-forward-passage-step'[\s\S]*?forward stonework return from the hidden alcove/);
  assert.match(platforms, /id:\s*'forgotten-mural-alcove-floor'[\s\S]*?invisible:\s*true/);
  [
    ['forgotten-mural-carved-wall-ledge', 'SACRED_MURAL_APPROACH_X\\(1080\\)', 218, 230],
    ['forgotten-mural-broken-warning-step', 'SACRED_MURAL_APPROACH_X\\(1113\\)', 160, 240],
    ['forgotten-mural-priest-passage-shelf', 'SACRED_MURAL_APPROACH_X\\(1145\\)', 104, 260],
    ['forgotten-mural-column-shelf', 'SACRED_MURAL_APPROACH_X\\(1180\\)', 44, 230],
    ['forgotten-mural-upper-doorway-floor', 'SACRED_MURAL_APPROACH_X\\(1212\\)', -42, 250],
    ['forgotten-mural-alcove-floor', '5010', 318, 2600],
    ['forgotten-mural-forward-passage-step', 'SACRED_MURAL_APPROACH_X\\(1223\\)', -54, 220],
    ['forgotten-mural-return-masonry', 'SACRED_MURAL_APPROACH_X\\(1219\\)', 52, 235],
  ].forEach(([id, xPattern, y, width]) => {
    const platformRow = getDataRowById(platforms, id);
    assert.match(platformRow, new RegExp(`x:\\s*${xPattern}[\\s\\S]*?y:\\s*JY\\(${y}\\)[\\s\\S]*?width:\\s*${width}[\\s\\S]*?invisible:\\s*true`));
    assert.doesNotMatch(platformRow, /secretVisibility:\s*'visible'/);
  });
  assert.match(platforms, /id:\s*'forgotten-mural-lower-masonry'/);
  assert.match(platforms, /id:\s*'forgotten-mural-lower-return'/);
  assert.doesNotMatch(platforms, /forgotten-mural[\s\S]*?floating/i);
  assert.match(shards, /\{\s*x:\s*934,\s*y:\s*-120,\s*hidden:\s*true,\s*routeId:\s*'desert-upper-survey-route'\s*\}/);
  assert.doesNotMatch(storyProps, /id:\s*'upper-route-note-marker'/);
  assert.ok(existsSync(forgottenMuralAlcoveClimbStructurePath), 'Forgotten Mural Alcove generated PNG should exist in desert-temple assets');
  assert.ok(existsSync(forgottenMuralChamberSourcePath), 'Forgotten Mural Chamber source PNG should exist in desert-temple assets');
  assert.ok(existsSync(forgottenMuralChamberPath), 'Forgotten Mural Chamber production PNG should exist in desert-temple assets');
  assert.ok(existsSync(forgottenMuralHiddenRevealPath), 'Forgotten Mural hidden reveal PNG should exist in desert-temple assets');
  assert.match(journeyComponentSource, /FORGOTTEN_MURAL_ALCOVE_CLIMB_STRUCTURE_SRC = 'assets\/expedition\/environment\/desert-temple\/forgotten-mural-alcove-climb-structure\.png'/);
  assert.match(journeyComponentSource, /FORGOTTEN_MURAL_CHAMBER_SRC = 'assets\/expedition\/environment\/desert-temple\/forgotten-mural-chamber\.png'/);
  assert.match(journeyComponentSource, /forgottenMuralAlcoveStructureRef/);
  assert.match(journeyComponentSource, /forgottenMuralChamberRef/);
  assert.match(storyProps, /id:\s*'forgotten-mural-climb-structure'[\s\S]*?type:\s*'generated-climb-structure'[\s\S]*?depth:\s*'route-edge'/);
  assert.doesNotMatch(storyProps, /id:\s*'forgotten-mural-alcove-panel'/);
  assert.match(journeyComponentSource, /prop\.type === 'generated-climb-structure'/);
  assert.match(journeyComponentSource, /drawForgottenMuralGeneratedAsset/);
  assert.match(journeyComponentSource, /const visibilityWidth = Math\.max\(isPrimaryBackgroundPlate \? CANVAS_WIDTH \* 1\.6 : 440, Number\(prop\.width\) \|\| 0\);/);
  assert.match(journeyComponentSource, /ctx\.drawImage\(structureAsset\.image/);
  assert.doesNotMatch(journeyComponentSource, /drawForgottenMuralStructure/);
  assert.doesNotMatch(journeyComponentSource, /drawForgottenMuralStair/);
  assert.match(events, /id:\s*'upper-route-choice'[\s\S]*?A faint scarab glow leaks from a cracked mural high above\./);
  assert.match(events, /id:\s*'forgotten-mural-looter-shadow'[\s\S]*?type:\s*'looter-shadow'/);
  assert.match(events, /A shadow moves above the ruins\. A blue scarab glow vanishes into the upper doorway\./);
  assert.match(journeyComponentSource, /event\.type === 'looter-shadow'/);
  assert.match(journeyComponentSource, /drawForgottenMuralChamberInterior/);
  assert.match(journeyComponentSource, /drawForgottenMuralChamberTransition/);
  assert.match(journeyComponentSource, /FORGOTTEN_MURAL_CHAMBER_TRANSITION_DURATION = 2\.15/);
  assert.match(journeyComponentSource, /phase:\s*'doorway-fade'/);
  assert.match(journeyComponentSource, /JOURNEY_SCENE_IDS = Object\.freeze/);
  assert.match(journeyComponentSource, /FORGOTTEN_MURAL_CHAMBER:\s*'forgotten-mural-chamber'/);
  assert.match(journeyComponentSource, /currentSceneId:\s*getJourneySceneId\(current\)/);
  assert.match(journeyComponentSource, /sceneTransitionState:/);
  assert.match(journeyComponentSource, /sceneReturn:/);
  assert.match(journeyComponentSource, /isEntityActiveInScene\(platform, current\)/);
  assert.match(journeyComponentSource, /isEntityActiveInScene\(hazard, current\)/);
  assert.match(journeyComponentSource, /isEntityActiveInScene\(secret, current\)/);
  assert.match(journeyComponentSource, /if \(!isEntityActiveInScene\(e, current\)\) return;/);
  assert.match(journeyComponentSource, /isEntityActiveInScene/);
  assert.match(scarabFragment, /sceneId:\s*'forgotten-mural-chamber'/);
  assert.match(scarabFragmentTwo, /sceneId:\s*'forgotten-mural-chamber'/);
  assert.match(scarabFragmentThree, /sceneId:\s*'forgotten-mural-chamber'/);
  assert.match(platforms, /id:\s*'forgotten-mural-alcove-floor'[\s\S]*?sceneId:\s*'forgotten-mural-chamber'/);
  assert.match(journeyComponentSource, /lockMovement:\s*true/);
  assert.match(journeyComponentSource, /FORGOTTEN_MURAL_CHAMBER_SWITCH_SECONDS/);
  assert.match(journeyComponentSource, /FORGOTTEN_MURAL_CHAMBER_ENTRY_SPAWN = \{/);
  assert.match(journeyComponentSource, /x:\s*scaleJourneyX\(918\)/);
  assert.match(journeyComponentSource, /y:\s*openingJourneyY\(318\)/);
  assert.match(journeyComponentSource, /FORGOTTEN_MURAL_CHAMBER_RETURN_FALLBACK = \{[\s\S]*?x:\s*SACRED_MURAL_APPROACH_X\(1220\)[\s\S]*?y:\s*openingJourneyY\(318\)/);
  assert.doesNotMatch(journeyComponentSource, /FORGOTTEN_MURAL_CHAMBER_RETURN_FALLBACK = \{[\s\S]*?x:\s*scaleJourneyX\(1030\)/);
  assert.doesNotMatch(journeyComponentSource, /FORGOTTEN_MURAL_CHAMBER_RETURN_FALLBACK = \{[\s\S]*?x:\s*scaleJourneyX\(665\)/);
  assert.match(journeyComponentSource, /player\.x = FORGOTTEN_MURAL_CHAMBER_ENTRY_SPAWN\.x - player\.width \/ 2/);
  assert.match(journeyComponentSource, /player\.y = FORGOTTEN_MURAL_CHAMBER_ENTRY_SPAWN\.y - player\.height/);
  assert.match(journeyComponentSource, /FORGOTTEN_MURAL_CHAMBER_CAMERA_X = scaleJourneyX\(880\)/);
  assert.match(journeyComponentSource, /mode:\s*'fixed-scene'/);
  assert.match(journeyComponentSource, /targetCameraX:\s*FORGOTTEN_MURAL_CHAMBER_CAMERA_X/);
  assert.match(journeyComponentSource, /player\.x = clamp\([\s\S]*?FORGOTTEN_MURAL_CHAMBER_BOUNDS\.minX[\s\S]*?FORGOTTEN_MURAL_CHAMBER_BOUNDS\.maxX - player\.width/);
  assert.match(journeyComponentSource, /id:\s*'forgotten-mural-chamber-exit'/);
  assert.match(journeyComponentSource, /toSceneId:\s*JOURNEY_SCENE_IDS\.EXTERIOR/);
  assert.match(journeyComponentSource, /FORGOTTEN_MURAL_CHAMBER_ENTRY_TRIGGER = \{[\s\S]*?minX:\s*SACRED_MURAL_APPROACH_X\(1213\)[\s\S]*?maxX:\s*SACRED_MURAL_APPROACH_X\(1247\)/);
  assert.match(journeyComponentSource, /FORGOTTEN_MURAL_CHAMBER_ENTRY_TRIGGER = \{[\s\S]*?footY:\s*openingJourneyY\(-42\)[\s\S]*?footTolerance:\s*18/);
  assert.match(platforms, /id:\s*'forgotten-mural-upper-doorway-floor'[\s\S]*?x:\s*SACRED_MURAL_APPROACH_X\(1212\)[\s\S]*?y:\s*JY\(-42\)[\s\S]*?width:\s*250/);
  assert.match(journeyComponentSource, /FORGOTTEN_MURAL_CHAMBER_EXIT_TRIGGER = \{[\s\S]*?minX:\s*scaleJourneyX\(880\)[\s\S]*?maxX:\s*scaleJourneyX\(906\)[\s\S]*?maxY:\s*GROUND_Y - 20/);
  assert.match(journeyComponentSource, /FORGOTTEN_MURAL_CHAMBER_EXIT_TRIGGER = \{[\s\S]*?footY:\s*openingJourneyY\(318\)[\s\S]*?footTolerance:\s*20/);
  assert.doesNotMatch(journeyComponentSource, /FORGOTTEN_MURAL_CHAMBER_EXIT_TRIGGER = \{[\s\S]*?maxX:\s*scaleJourneyX\(950\)/);
  assert.match(journeyComponentSource, /forgottenMuralChamberActive/);
  assert.match(journeyComponentSource, /forgottenMuralLooterSeen/);
  assert.match(journeyComponentSource, /forgottenMuralChamberRestored/);
  assert.match(journeyComponentSource, /forgottenMuralChamberTransitionState/);
  assert.match(journeyComponentSource, /id:\s*'forgotten-mural-entry-door'[\s\S]*?routeId:\s*'desert-upper-survey-route'[\s\S]*?entryPlatformId:\s*'forgotten-mural-upper-doorway-floor'/);
  assert.match(journeyComponentSource, /forgottenMuralEntryTrigger = resolveChamberEntryTrigger\(forgottenMuralEntryDoor\)/);
  assert.match(journeyComponentSource, /forgottenMuralPlayerCenterX >= forgottenMuralEntryTrigger\.minX/);
  assert.match(journeyComponentSource, /forgottenMuralPlayerCenterX <= forgottenMuralEntryTrigger\.maxX/);
  assert.match(journeyComponentSource, /player\.y < forgottenMuralEntryTrigger\.maxY/);
  assert.match(journeyComponentSource, /currentSceneId === JOURNEY_SCENE_IDS\.EXTERIOR[\s\S]*?&& player\.onGround[\s\S]*?forgottenMuralEntryTrigger\.minX/);
  assert.match(journeyComponentSource, /Math\.abs\(forgottenMuralPlayerFootY - forgottenMuralEntryTrigger\.footY\) <= forgottenMuralEntryTrigger\.footTolerance/);
  assert.match(journeyComponentSource, /Math\.abs\(forgottenMuralPlayerFootY - FORGOTTEN_MURAL_CHAMBER_EXIT_TRIGGER\.footY\) <= FORGOTTEN_MURAL_CHAMBER_EXIT_TRIGGER\.footTolerance/);
  assert.match(journeyComponentSource, /secretClimbRouteIds = \['mummification-chamber-route', 'desert-upper-survey-route'\]/);
  assert.match(journeyComponentSource, /const desiredSecretVerticalCameraOffset = !chamberSceneActive && inVerticalCameraWindow/);
  assert.match(journeyUtilsSource, /forgottenMuralChamberActive:\s*false/);
  assert.match(journeyUtilsSource, /forgottenMuralChamberTransition:\s*null/);
  assert.match(journeyUtilsSource, /currentSceneId:\s*'egypt-exterior-route'/);
  assert.match(journeyUtilsSource, /sceneTransition:\s*null/);
  assert.match(journeyUtilsSource, /sceneReturn:\s*null/);
  assert.match(journeyUtilsSource, /forgottenMuralLooterSeen:\s*false/);

  assert.match(routeGates, /id:\s*'temple-approach-seal'[\s\S]*?requires:\s*\{[\s\S]*?shards:\s*4/);
  assert.match(routeGates, /id:\s*'guardian-prep-seal'[\s\S]*?requires:\s*\{\s*objective:\s*'desert-entry'[\s\S]*?shards:\s*6/);
  assert.match(routeGates, /id:\s*'desert-seal'[\s\S]*?requires:\s*\{\s*objective:\s*'desert-entry',\s*miniBoss:\s*'scarab-queen',\s*keyItem:\s*'brush-handle',\s*shards:\s*10/);
  assert.match(journeyComponentSource, /forgottenMuralRestored:\s*Boolean\(current\.forgottenMuralChamberRestored/);
  assert.match(journeyComponentSource, /getRoomRestorationStatus\(secret, current\)/);
  assert.match(journeyComponentSource, /forgottenMuralCameraFrameActive/);
  assert.match(journeyComponentSource, /secretVerticalCameraOffset/);
  assert.match(journeyComponentSource, /name:\s*forgottenMuralPuzzleReady \? 'Asha' : restoredRoom \? 'Anubis' : 'Secret Found'/);
  assert.match(journeyComponentSource, /If the image is wrong, the story is wrong\./);
  assert.match(journeyComponentSource, /The scarab mural has been broken into pieces\. Not destroyed\. Rearranged\./);
  assert.match(journeyComponentSource, /You pass my seals, but I still see only an intruder\./);
  assert.doesNotMatch(journeyComponentSource, /class\s+SecretRoute|createSecretSystem|SecretRouteController|class\s+LooterAI|createRoomSystem|new\s+PlayerController/);
});

test('forgotten mural relic fragments open an in-room slide puzzle before restoration', () => {
  assert.match(journeyUtilsSource, /FORGOTTEN_MURAL_RELIC_SLIDE_PUZZLE_VERSION = 'forgotten-mural-relic-slide-puzzle-2026-06-01-harder'/);
  assert.match(journeyUtilsSource, /FORGOTTEN_MURAL_RELIC_SLIDE_PUZZLE_START_TILES = Object\.freeze\(\[2, null, 6, 1, 5, 0, 3, 7, 4\]\)/);
  assert.match(journeyUtilsSource, /FORGOTTEN_MURAL_RELIC_SLIDE_PUZZLE_SOLVED_TILES = Object\.freeze\(\[0, 1, 2, 3, 4, 5, 6, 7, null\]\)/);
  assert.match(journeyComponentSource, /FORGOTTEN_MURAL_RELIC_SLIDE_PUZZLE_ART_SRC = 'assets\/expedition\/environment\/desert-temple\/forgotten-mural-relic-slide-puzzle-2026-06-01\.png'/);
  assert.match(journeyUtilsSource, /forgottenMuralRelicSlidePuzzleOpen:\s*false/);
  assert.match(journeyUtilsSource, /forgottenMuralRelicSlidePuzzleSolved:\s*false/);
  assert.match(journeyUtilsSource, /forgottenMuralRelicSlidePuzzleMoves:\s*0/);
  assert.match(journeyComponentSource, /current\.forgottenMuralRelicSlidePuzzleOpen = true/);
  assert.match(journeyComponentSource, /current\.forgottenMuralRelicSlidePuzzleTiles = createForgottenMuralRelicSlidePuzzleTiles\(\)/);
  assert.match(journeyComponentSource, /forgottenMuralRelicSlidePuzzleOpen:\s*Boolean\(current\.forgottenMuralRelicSlidePuzzleOpen\)/);
  assert.match(journeyComponentSource, /forgottenMuralRelicSlidePuzzleVersion:\s*FORGOTTEN_MURAL_RELIC_SLIDE_PUZZLE_VERSION/);
  assert.match(journeyComponentSource, /moveForgottenMuralRelicSlideTile/);
  assert.match(journeyComponentSource, /className="forgotten-mural-slide-puzzle-overlay"/);
  assert.match(journeyComponentSource, /className="forgotten-mural-slide-puzzle-grid"/);
  assert.match(journeyComponentSource, /'--relic-art-url': `url\("\$\{import\.meta\.env\.BASE_URL\}\$\{FORGOTTEN_MURAL_RELIC_SLIDE_PUZZLE_ART_SRC\}"\)`/);
  assert.match(journeyComponentSource, /'--tile-bg-x': `\$\{\(tile % 3\) \* 50\}%`/);
  assert.match(journeyComponentSource, /'--tile-bg-y': `\$\{Math\.floor\(tile \/ 3\) \* 50\}%`/);
  assert.match(journeyComponentSource, /current\.forgottenMuralChamberRestored = true/);
  assert.match(journeyComponentSource, /current\.forgottenMuralRelicSlidePuzzleSolved = true/);
  assert.match(journeyComponentSource, /The scarab settles into place\. Something opens behind the wall\./);
  assert.match(journeyComponentSource, /The Queen is not taking from the dead\. She is gathering what remained\./);
  assert.match(journeyComponentSource, /This does not show a theft\. It shows a rescue\./);
  assert.match(journeyComponentSource, /Slide the rearranged stone cuts until the image tells the right story\./);
  assert.match(journeyComponentSource, /3 seal cuts placed/);
  assert.match(journeyComponentSource, /if \(current\.forgottenMuralChamberRestored\) \{/);
  assert.match(journeyComponentSource, /FORGOTTEN_MURAL_HIDDEN_MEMORY_REVEAL_SRC = 'assets\/expedition\/environment\/desert-temple\/forgotten-mural-hidden-memory-reveal-2026-06-01\.png'/);
  assert.match(journeyComponentSource, /forgottenMuralHiddenRevealRef/);
  assert.match(journeyComponentSource, /forgottenMuralHiddenRevealLoaded:\s*forgottenMuralHiddenRevealRef\.current\.loaded/);
  assert.match(journeyComponentSource, /ctx\.drawImage\(revealAsset\.image,\s*muralX,\s*muralY,\s*muralWidth,\s*muralHeight\)/);
  assert.doesNotMatch(journeyComponentSource, /memoryAnchorDots/);
  assert.match(journeyComponentSource, /forgottenMuralPuzzleReady[\s\S]*?current\.forgottenMuralRelicSlidePuzzleOpen = true/);
  assert.match(journeyComponentSource, /isForgottenMuralRelicSlidePuzzleSolved\(nextTiles\)[\s\S]*?current\.forgottenMuralChamberRestored = true/);
  assert.match(devToolsSource, /jumpToExpeditionStage\('journey-forgotten-mural-puzzle'\)/);
  assert.match(expeditionModeSource, /event\.detail\?\.target === 'journey-forgotten-mural-puzzle'/);
  assert.match(journeyComponentSource, /target === 'journey-forgotten-mural-puzzle'/);

  let tiles = createForgottenMuralRelicSlidePuzzleTiles();
  [4, 5, 2, 1, 0, 3, 4, 5, 8, 7, 4, 5, 2, 1, 0, 3, 6, 7, 8].forEach((tileIndex) => {
    tiles = getForgottenMuralRelicSlideMove(tiles, tileIndex);
    assert.ok(Array.isArray(tiles), `tile index ${tileIndex} should be movable`);
  });
  assert.equal(isForgottenMuralRelicSlidePuzzleSolved(tiles), true);
});

test('scribe locked chamber reuses the Journey scene and challenge systems for optional Egypt decoding', () => {
  const hiddenRoutes = extractExportedArray('HIDDEN_ROUTES');
  const platforms = extractExportedArray('PLATFORMS');
  const storyProps = extractExportedArray('STORY_PROPS');
  const scribeRoute = getDataRowById(hiddenRoutes, 'scribe-locked-chamber-route');
  const chamberFloor = getDataRowById(platforms, 'scribe-locked-chamber-floor');
  const scribeDoorway = getDataRowById(storyProps, 'scribe-chamber-doorway-structure');

  assert.match(scribeRoute, /name:\s*'The Scribe\\'s Locked Chamber'/);
  assert.match(scribeRoute, /civilisation:\s*'Ancient Egypt'/);
  assert.match(scribeRoute, /sectionId:\s*'desert-entry'/);
  assert.match(scribeRoute, /optional:\s*true/);
  assert.match(scribeRoute, /x:\s*SACRED_SCRIBE_APPROACH_X\(1684\)/);
  assert.match(scribeRoute, /y:\s*JY\(62\)/);
  assert.match(scribeRoute, /rewardHint:\s*'A raised scribe doorway glows above the ruined stairs\.'/);
  assert.match(scribeRoute, /gateType:\s*'sealed scribe doorway'/);
  assert.match(scribeRoute, /rewardSummary:\s*'Hieroglyphic translation puzzle and protected knowledge clue'/);
  assert.match(chamberFloor, /sceneId:\s*'scribe-locked-chamber'/);
  assert.match(storyProps, /id:\s*'scribe-chamber-doorway-structure'[\s\S]*?type:\s*'generated-scribe-chamber-doorway'[\s\S]*?depth:\s*'route-edge'/);
  assert.match(scribeDoorway, /sectionId:\s*'desert-entry'/);
  assert.match(scribeDoorway, /x:\s*SACRED_SCRIBE_APPROACH_X\(1685\)/);
  assert.match(scribeDoorway, /y:\s*JY\(-259\)/);
  assert.match(scribeDoorway, /width:\s*1120/);
  assert.match(scribeDoorway, /height:\s*620/);
  [
    ['scribe-chamber-collapsed-stair-slab', '1642', '238', '120'],
    ['scribe-chamber-middle-rubble-landing', '1668', '198', '235'],
    ['scribe-chamber-upper-carved-landing', '1678', '122', '210'],
    ['scribe-chamber-doorway-threshold', '1684', '62', '180'],
  ].forEach(([platformId, authoredX, authoredY, width]) => {
    const platform = getDataRowById(platforms, platformId);
    assert.match(platform, new RegExp(`x:\\s*SACRED_SCRIBE_APPROACH_X\\(${authoredX}\\)`));
    assert.match(platform, new RegExp(`y:\\s*JY\\(${authoredY}\\)`));
    assert.match(platform, new RegExp(`width:\\s*${width}`));
    assert.match(platform, /invisible:\s*true/);
  });
  assert.match(platforms, /id:\s*'scribe-chamber-buried-lower-block'[\s\S]*?x:\s*SACRED_SCRIBE_APPROACH_X\(1597\)[\s\S]*?y:\s*JY\(284\)[\s\S]*?width:\s*95/);
  assert.ok(hiddenRoutes.indexOf("id: 'desert-upper-survey-route'") < hiddenRoutes.indexOf("id: 'scribe-locked-chamber-route'"));
  assert.ok(hiddenRoutes.indexOf("id: 'scribe-locked-chamber-route'") < hiddenRoutes.indexOf("id: 'temple-cracked-wall-passage'"));
  assert.match(journeyUtilsSource, /scribeChamberEntered:\s*false/);
  assert.match(journeyUtilsSource, /scribeChamberDoorSealed:\s*false/);
  assert.match(journeyUtilsSource, /scribeChamberTabletInspected:\s*false/);
  assert.match(journeyUtilsSource, /scribeChamberWallInspected:\s*false/);
  assert.match(journeyUtilsSource, /scribeChamberExitUnlocked:\s*false/);
  assert.match(journeyUtilsSource, /scribeChamberPuzzleSolved:\s*false/);
  assert.match(journeyComponentSource, /SCRIBE_LOCKED_CHAMBER:\s*'scribe-locked-chamber'/);
  assert.ok(existsSync(scribeChamberExteriorPath), 'Scribe Chamber exterior production PNG should exist');
  assert.ok(existsSync(scribeChamberInteriorPath), 'Scribe Chamber interior replacement PNG should exist');
  assert.match(journeyComponentSource, /SCRIBE_CHAMBER_EXTERIOR_SRC = 'assets\/expedition\/environment\/desert-temple\/scribe-locked-chamber-exterior-climb-structure-v3\.png'/);
  assert.match(journeyComponentSource, /SCRIBE_CHAMBER_EXTERIOR_VERSION = 'imagegen-scribe-locked-chamber-exterior-v3-2026-06-05'/);
  assert.match(journeyComponentSource, /SCRIBE_CHAMBER_INTERIOR_SRC = 'assets\/expedition\/environment\/desert-temple\/scribe-locked-chamber-interior-2026-06-01\.png'/);
  assert.match(journeyComponentSource, /SCRIBE_CHAMBER_INTERIOR_VERSION = 'imagegen-scribe-locked-chamber-interior-2026-06-01'/);
  assert.match(journeyComponentSource, /scribeChamberExteriorRef/);
  assert.match(journeyComponentSource, /scribeChamberInteriorRef/);
  assert.match(journeyComponentSource, /image\.src = `\$\{import\.meta\.env\.BASE_URL\}\$\{SCRIBE_CHAMBER_INTERIOR_SRC\}`/);
  assert.match(journeyComponentSource, /const chamberAsset = scribeChamberInteriorRef\.current/);
  assert.match(journeyComponentSource, /scribeChamberInteriorLoaded:\s*scribeChamberInteriorRef\.current\.loaded/);
  assert.match(journeyComponentSource, /drawScribeChamberDoorwayStructure/);
  assert.match(journeyComponentSource, /scribeChamberExteriorLoaded:\s*scribeChamberExteriorRef\.current\.loaded/);
  assert.match(journeyComponentSource, /scribeChamberGroundBlendAssetKeys/);
  assert.match(journeyComponentSource, /'softSandDrift'/);
  assert.match(journeyComponentSource, /'edgePebbleScatter'/);
  assert.match(journeyComponentSource, /'rubbleClusterSmall'/);
  assert.match(journeyComponentSource, /'rubbleClusterLarge'/);
  assert.match(journeyComponentSource, /prop\.type === 'generated-scribe-chamber-doorway'/);
  assert.match(journeyComponentSource, /drawScribeLockedChamberInterior/);
  assert.match(journeyComponentSource, /Scribe Chamber Decoding/);
  assert.match(journeyComponentSource, /Sun \+ Water \+ Ankh \+ Door/);
  assert.match(journeyComponentSource, /Follow the light, cross the river, protect life, and the door will open\./);
  assert.match(journeyComponentSource, /That does not match the message\. I need to look again\./);
  assert.match(journeyComponentSource, /Knowledge was the key\./);
  assert.match(journeyComponentSource, /scribeChamberExitUnlocked/);
  assert.match(journeyComponentSource, /activeGuardianChallenge\.type === 'scribe-chamber-puzzle'/);
  assert.match(journeyComponentSource, /SCRIBE_CHAMBER_RETURN_FALLBACK = \{[\s\S]*?x:\s*SACRED_SCRIBE_APPROACH_X\(1684\)[\s\S]*?y:\s*openingJourneyY\(122\)/);
  assert.match(journeyComponentSource, /SCRIBE_CHAMBER_ENTRY_TRIGGER = \{[\s\S]*?minX:\s*SACRED_SCRIBE_APPROACH_X\(1684\)[\s\S]*?maxX:\s*SACRED_SCRIBE_APPROACH_X\(1714\)[\s\S]*?footY:\s*openingJourneyY\(62\)/);
  assert.match(journeyComponentSource, /scarabQueenRequiresScribe/);
  assert.match(journeyComponentSource, /!current\.scribeChamberPuzzleSolved/);
  assert.doesNotMatch(journeyComponentSource, /createScribeEscapeRoomMode|ScribeEscapeRoom\.jsx/);
});

test('Egypt chamber exteriors have a ten-second walking rhythm before the Queen', () => {
  const hiddenRoutes = extractExportedArray('HIDDEN_ROUTES');
  const routeGates = extractExportedArray('ROUTE_GATES');
  const miniBosses = extractExportedArray('MINI_BOSSES');
  const sections = extractExportedArray('SECTIONS');

  const mummificationDoorX = 770;
  const muralDoorX = 1350;
  const scribeDoorX = 1930;
  const secondsAtAshaSpeed = (from, to) => ((to - from) * 5.65) / 260;

  [
    ['mummification-to-mural', mummificationDoorX, muralDoorX],
    ['mural-to-scribe', muralDoorX, scribeDoorX],
  ].forEach(([, from, to]) => {
    assert.ok(secondsAtAshaSpeed(from, to) >= 12);
  });

  assert.match(journeyConstantsSource, /SACRED_EXTERIOR_SPACING_BASE_UNITS/);
  assert.match(journeyConstantsSource, /sacredMuralExteriorX/);
  assert.match(journeyConstantsSource, /sacredScribeExteriorX/);
  assert.match(source, /SACRED_MURAL_APPROACH_X/);
  assert.match(source, /SACRED_SCRIBE_APPROACH_X/);
  assert.match(journeyComponentSource, /SACRED_MURAL_APPROACH_X/);
  assert.match(journeyComponentSource, /SACRED_SCRIBE_APPROACH_X/);
  assert.match(sections, /id:\s*'desert-entry'[\s\S]*?end:\s*X\(2360\)/);
  assert.match(sections, /id:\s*'ruined-temple'[\s\S]*?start:\s*X\(2360\)/);
  assert.match(hiddenRoutes, /id:\s*'mummification-chamber-route'[\s\S]*?x:\s*X\(520\)/);
  assert.match(hiddenRoutes, /id:\s*'desert-upper-survey-route'[\s\S]*?x:\s*SACRED_MURAL_APPROACH_X\(1125\)/);
  assert.match(hiddenRoutes, /id:\s*'scribe-locked-chamber-route'[\s\S]*?x:\s*SACRED_SCRIBE_APPROACH_X\(1684\)/);
  assert.match(miniBosses, /id:\s*'scarab-queen'[\s\S]*?x:\s*X\(2150\)[\s\S]*?arenaStart:\s*X\(2020\)[\s\S]*?arenaEnd:\s*X\(2235\)/);
  assert.match(routeGates, /id:\s*'desert-seal'[\s\S]*?x:\s*X\(2285\)/);
});

test('Egypt chamber interiors stay separate and exit back to their exterior artwork doorways', () => {
  assert.match(
    journeyComponentSource,
    /id:\s*'mummification-chamber-exit',\s*phase:\s*'doorway-fade',\s*fromSceneId:\s*JOURNEY_SCENE_IDS\.MUMMIFICATION_CHAMBER,\s*toSceneId:\s*JOURNEY_SCENE_IDS\.EXTERIOR,/,
  );
  assert.match(
    journeyComponentSource,
    /id:\s*'forgotten-mural-chamber-exit',\s*phase:\s*'doorway-fade',\s*fromSceneId:\s*JOURNEY_SCENE_IDS\.FORGOTTEN_MURAL_CHAMBER,\s*toSceneId:\s*JOURNEY_SCENE_IDS\.EXTERIOR,/,
  );
  assert.match(
    journeyComponentSource,
    /SCRIBE_CHAMBER_RETURN_FALLBACK = \{[\s\S]*?x:\s*SACRED_SCRIBE_APPROACH_X\(1684\)[\s\S]*?y:\s*openingJourneyY\(122\)[\s\S]*?direction:\s*1/,
  );
});

test('Sacred Record Way story beats stay textual and do not reintroduce obsolete PNG background strips', () => {
  const storyProps = extractExportedArray('STORY_PROPS');
  const landmarks = extractExportedArray('WORLD_CONTINUITY_LANDMARKS');
  const events = extractExportedArray('ENVIRONMENT_EVENTS');
  const hiddenRoutes = extractExportedArray('HIDDEN_ROUTES');

  assert.doesNotMatch(landmarks, /id:\s*'sacred-record-way-/);
  assert.doesNotMatch(landmarks, /type:\s*'record-way-png'/);
  assert.doesNotMatch(landmarks, /PNG background art/);
  assert.doesNotMatch(storyProps, /id:\s*'sacred-record-way-/);

  [
    ['record-way-body-to-image', 'Sacred Record Way', 'body, image, writing, then the guardian'],
    ['record-way-images-become-symbols', 'Broken Image Field', 'The pictures become symbols here'],
    ['record-way-knowledge-under-guard', 'Knowledge Under Guard', 'The scribes protected knowledge'],
  ].forEach(([id, name, message]) => {
    const event = getDataRowById(events, id);
    assert.match(event, /sectionId:\s*'desert-entry'/);
    assert.match(event, new RegExp(`name:\\s*'${name}'`));
    assert.match(event, new RegExp(message.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });

  [
    'sacred-record-way-mummification-link.png',
    'sacred-record-way-mural-link.png',
    'sacred-record-way-scribe-link.png',
  ].forEach((filename) => {
    assert.equal(
      existsSync(new URL(`../../../public/assets/expedition/environment/desert-temple/${filename}`, import.meta.url)),
      false,
      `${filename} should stay deleted as obsolete background art`,
    );
    assert.doesNotMatch(journeyComponentSource, new RegExp(filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });
  assert.doesNotMatch(journeyComponentSource, /landmark\.type === 'record-way-png'/);
  assert.doesNotMatch(journeyComponentSource, /sacredRecordWayBackgroundRef/);
  assert.doesNotMatch(journeyComponentSource, /SacredRecordWaySystem|createWorldbuildingSystem|RecordWayController/);

  const bodyRoute = getDataRowById(hiddenRoutes, 'mummification-chamber-route');
  const imageRoute = getDataRowById(hiddenRoutes, 'desert-upper-survey-route');
  const nameRoute = getDataRowById(hiddenRoutes, 'scribe-locked-chamber-route');
  assert.match(bodyRoute, /Body \/ preservation/);
  assert.match(bodyRoute, /Exit back to the exterior route/);
  assert.match(imageRoute, /Image \/ memory/);
  assert.match(imageRoute, /damaged pictures and missing captions/);
  assert.match(nameRoute, /Name \/ identity/);
  assert.match(nameRoute, /Queen\\'s public story is incomplete/);

  [
    ['anubis-body-judgement', 'Body Judged', 'You touched the dead carefully. That is not trust.'],
    ['body-to-image-clue', 'Body to Image', 'The linen mark repeats in broken wall images ahead.'],
    ['anubis-image-judgement', 'Image Judged', 'You repaired an image instead of taking from it.'],
    ['image-to-name-clue', 'Image to Name', 'The restored picture exposes missing captions and scribe cuts.'],
    ['anubis-name-judgement', 'Name Judged', 'A name remembered can still accuse.'],
    ['queen-story-contradiction', 'Contradictory Record', 'The Queen was not only guarding treasure.'],
  ].forEach(([id, name, message]) => {
    const event = getDataRowById(events, id);
    assert.match(event, /sectionId:\s*'desert-entry'/);
    assert.match(event, new RegExp(`name:\\s*'${name}'`));
    assert.match(event, new RegExp(message.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.doesNotMatch(event, /requires|gate|shards|trustMeter|anubisTrust/);
  });
});

test('Sacred Record Way polish does not add foreground inspection interactions or runtime state', () => {
  const interactions = extractExportedArray('ENVIRONMENT_INTERACTIONS');

  assert.doesNotMatch(interactions, /record-way-inspection/);
  assert.doesNotMatch(interactions, /record-way-[a-z-]+-inspection/);
  assert.doesNotMatch(journeyComponentSource, /recordWayInspectedIds/);
  assert.doesNotMatch(journeyComponentSource, /recordWayInspectionCount/);
  assert.doesNotMatch(journeyComponentSource, /interaction\.type === 'record-way-inspection'/);
  assert.doesNotMatch(journeyUtilsSource, /recordWayInspectedIds/);
});

test('mummification chamber exterior reuses Journey routes, ledges, assets, and entrance discovery before the mural room', () => {
  const hiddenRoutes = extractExportedArray('HIDDEN_ROUTES');
  const platforms = extractExportedArray('PLATFORMS');
  const storyProps = extractExportedArray('STORY_PROPS');
  const mummificationRoute = getDataRowById(hiddenRoutes, 'mummification-chamber-route');
  const muralRoute = getDataRowById(hiddenRoutes, 'desert-upper-survey-route');
  const exteriorStructure = getDataRowById(storyProps, 'mummification-chamber-exterior-structure');

  assert.ok(existsSync(mummificationChamberExteriorPath), 'Mummification Chamber exterior art should exist as a project asset');
  assert.match(mummificationRoute, /name:\s*'The Mummification Chamber'/);
  assert.match(mummificationRoute, /civilisation:\s*'Ancient Egypt'/);
  assert.match(mummificationRoute, /sectionId:\s*'desert-entry'/);
  assert.match(mummificationRoute, /optional:\s*true/);
  assert.match(mummificationRoute, /x:\s*X\(520\)/);
  assert.match(muralRoute, /x:\s*SACRED_MURAL_APPROACH_X\(1125\)/);
  assert.ok(hiddenRoutes.indexOf("id: 'mummification-chamber-route'") < hiddenRoutes.indexOf("id: 'desert-upper-survey-route'"));
  assert.match(mummificationRoute, /gateType:\s*'partly buried sacred doorway'/);
  assert.match(mummificationRoute, /first sacred mystery/i);
  assert.match(exteriorStructure, /type:\s*'generated-mummification-chamber-entrance'/);
  assert.match(exteriorStructure, /depth:\s*'background'/);
  assert.match(exteriorStructure, /layer:\s*'background'/);
  assert.match(exteriorStructure, /x:\s*MUMMIFICATION_EXTERIOR_X\(685\)/);
  assert.match(exteriorStructure, /y:\s*JY\(-400\)/);
  assert.match(exteriorStructure, /label:/);
  [
    ['mummification-chamber-bottom-secret-threshold', '638', '257', '176'],
    ['mummification-chamber-sand-buried-block', '647', '223', '176'],
    ['mummification-chamber-far-left-ground-shelf', '563', '175', '176'],
    ['mummification-chamber-left-lower-terrace', '586', '115', '311'],
    ['mummification-chamber-left-sandstone-shelf', '586', '-25', '212'],
    ['mummification-chamber-left-column-cap', '606', '-63', '130'],
    ['mummification-chamber-central-left-shelf', '657', '148', '210'],
    ['mummification-chamber-central-drop-slab', '681', '55', '192'],
    ['mummification-chamber-carved-lower-ledge', '708', '0', '212'],
    ['mummification-chamber-right-low-landing', '724', '240', '197'],
    ['mummification-chamber-right-stair-landing', '701', '135', '155'],
    ['mummification-chamber-right-column-cap', '726', '-30', '212'],
    ['mummification-chamber-upper-rite-ledge', '684', '-109', '218'],
    ['mummification-chamber-left-doorway-ledge', '659', '-156', '259'],
    ['mummification-chamber-upper-left-platform', '659', '-255', '238'],
    ['mummification-chamber-upper-right-platform', '745', '-156', '228'],
    ['mummification-chamber-doorway-floor', '708', '-222', '228'],
  ].forEach(([id, authoredX, authoredY, width]) => {
    const platform = getDataRowById(platforms, id);
    assert.match(platform, new RegExp(`x:\\s*MUMMIFICATION_EXTERIOR_X\\(${authoredX}\\)`));
    assert.match(platform, new RegExp(`y:\\s*JY\\(${authoredY}\\)`));
    assert.match(platform, new RegExp(`width:\\s*${width}`));
    assert.match(platform, /secret:\s*true/);
    assert.match(platform, /invisible:\s*true/);
  });
  assert.ok(platforms.indexOf("id: 'mummification-chamber-doorway-floor'") < platforms.indexOf("id: 'forgotten-mural-carved-wall-ledge'"));
  assert.match(journeyUtilsSource, /mummificationChamberEntranceDiscovered:\s*false/);
  assert.match(journeyComponentSource, /MUMMIFICATION_CHAMBER_EXTERIOR_SRC = 'assets\/expedition\/environment\/desert-temple\/mummification-chamber-exterior-ledged-building-2026-06-12\.png'/);
  assert.match(journeyComponentSource, /MUMMIFICATION_EXTERIOR_WORLD_OFFSET = scaleJourneyX\(70\)/);
  assert.match(journeyComponentSource, /MUMMIFICATION_CHAMBER_ENTRY_TRIGGER = \{[\s\S]*?minX:\s*mummificationExteriorWorldX\(688\)[\s\S]*?maxX:\s*mummificationExteriorWorldX\(724\)/);
  assert.match(journeyComponentSource, /MUMMIFICATION_CHAMBER_ENTRY_TRIGGER = \{[\s\S]*?footY:\s*openingJourneyY\(-135\)[\s\S]*?footTolerance:\s*42/);
  assert.match(journeyComponentSource, /drawMummificationChamberExteriorAsset/);
  assert.match(journeyComponentSource, /drawMummificationChamberExteriorAsset[\s\S]*?drawEgyptStructureGroundContactLayer/);
  assert.match(journeyComponentSource, /prop\.type === 'generated-mummification-chamber-entrance'/);
  assert.match(journeyComponentSource, /discoveredHiddenRouteIds\?\.add\('mummification-chamber-route'\)/);
  assert.match(journeyComponentSource, /hiddenRoomsFound\?\.add\('mummification-chamber'\)/);
  assert.match(journeyComponentSource, /mummificationChamberEntranceDiscovered:\s*Boolean\(current\.mummificationChamberEntranceDiscovered\)/);
  assert.match(journeyComponentSource, /secretClimbRouteIds = \['mummification-chamber-route', 'desert-upper-survey-route'\]/);
  assert.doesNotMatch(journeyComponentSource, /createMummificationRoomSystem|MummificationChamber\.jsx|class\s+MummificationRoom/);
});

test('mummification chamber entrance uses the existing Journey chamber transition and sealed interior state', () => {
  const platforms = extractExportedArray('PLATFORMS');
  const chamberFloor = getDataRowById(platforms, 'mummification-chamber-floor');

  assert.match(chamberFloor, /sceneId:\s*'mummification-chamber'/);
  assert.match(journeyUtilsSource, /mummificationChamberEntered:\s*false/);
  assert.match(journeyUtilsSource, /mummificationChamberActive:\s*false/);
  assert.match(journeyUtilsSource, /mummificationChamberDoorSealed:\s*false/);
  assert.match(journeyUtilsSource, /mummificationChamberExitUnlocked:\s*false/);
  assert.match(journeyUtilsSource, /mummificationChamberPuzzleSolved:\s*false/);
  assert.match(journeyComponentSource, /MUMMIFICATION_CHAMBER:\s*'mummification-chamber'/);
  assert.match(journeyComponentSource, /MUMMIFICATION_CHAMBER_ENTRY_SPAWN = \{/);
  assert.match(journeyComponentSource, /MUMMIFICATION_CHAMBER_RETURN_FALLBACK = \{/);
  assert.match(journeyComponentSource, /MUMMIFICATION_CHAMBER_EXIT_TRIGGER = \{/);
  assert.match(journeyComponentSource, /isMummificationChamberScene/);
  assert.match(journeyComponentSource, /drawMummificationChamberInterior/);
  assert.match(journeyComponentSource, /enteringMummificationChamber/);
  assert.match(journeyComponentSource, /toSceneId:\s*JOURNEY_SCENE_IDS\.MUMMIFICATION_CHAMBER/);
  assert.match(journeyComponentSource, /current\.mummificationChamberDoorSealed = true/);
  assert.match(journeyComponentSource, /current\.mummificationChamberExitUnlocked = Boolean\(current\.mummificationChamberPuzzleSolved\)/);
  assert.match(journeyComponentSource, /This chamber still holds power/);
  assert.match(journeyComponentSource, /This is a mummification chamber/);
  assert.match(journeyComponentSource, /The entrance sealed behind me/);
  assert.match(journeyComponentSource, /The entrance is sealed\. I need to solve the chamber first\./);
  assert.match(journeyComponentSource, /mummificationChamberEntered:\s*Boolean\(current\.mummificationChamberEntered\)/);
  assert.match(journeyComponentSource, /mummificationChamberDoorSealed:\s*Boolean\(current\.mummificationChamberDoorSealed\)/);
  assert.doesNotMatch(journeyComponentSource, /createMummificationRoomSystem|MummificationChamber\.jsx|class\s+MummificationRoom/);
});

test('mummification chamber interior uses a project-bound game-ready environment asset with readable puzzle zones', () => {
  assert.ok(existsSync(mummificationChamberInteriorPath), 'Mummification Chamber interior art should exist as a project asset');
  assert.match(journeyComponentSource, /MUMMIFICATION_CHAMBER_INTERIOR_SRC = 'assets\/expedition\/environment\/desert-temple\/mummification-chamber-interior-side-scroll-2026-05-31\.png'/);
  assert.match(journeyComponentSource, /MUMMIFICATION_CHAMBER_INTERIOR_VERSION = 'imagegen-mummification-chamber-side-scroll-puzzle-ready-2026-05-31'/);
  assert.match(journeyComponentSource, /MUMMIFICATION_CHAMBER_ENTRY_SPAWN = \{\s*x:\s*scaleJourneyX\(596\)/);
  assert.match(journeyComponentSource, /mummificationChamberInteriorRef/);
  assert.match(journeyComponentSource, /image\.src = `\$\{import\.meta\.env\.BASE_URL\}\$\{MUMMIFICATION_CHAMBER_INTERIOR_SRC\}`/);
  assert.match(journeyComponentSource, /const chamberAsset = mummificationChamberInteriorRef\.current/);
  assert.match(journeyComponentSource, /ctx\.drawImage\(chamberAsset\.image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT\)/);
  assert.match(journeyComponentSource, /mummificationChamberInteriorLoaded:\s*mummificationChamberInteriorRef\.current\.loaded/);
  assert.match(journeyComponentSource, /mummificationChamberPuzzleCenterpiece/);
  assert.match(journeyComponentSource, /mummificationChamberReadableZones/);
  assert.match(journeyComponentSource, /side-on mummification chamber, reachable mummy table, linen, canopic jars, oils, ritual tablet, Anubis statue, glowing exit seal/);
  assert.match(journeyComponentSource, /mummificationChamberPuzzleCenterpiece:\s*\{ x:\s*565,\s*y:\s*310,\s*radiusX:\s*210,\s*radiusY:\s*64 \}/);
  assert.match(journeyComponentSource, /\{ id:\s*'linen-and-oils',\s*x:\s*350,\s*y:\s*465,\s*radiusX:\s*140,\s*radiusY:\s*82 \}/);
  assert.match(journeyComponentSource, /\{ id:\s*'ritual-tablet',\s*x:\s*780,\s*y:\s*475,\s*radiusX:\s*80,\s*radiusY:\s*90 \}/);
});

test('mummification chamber interaction objects reuse Journey asset packs and notice dialogue', () => {
  assert.ok(existsSync(mummificationChamberInteractionAtlasPath), 'Mummification Chamber interaction atlas should exist as a project asset');
  [
    'embalmingTableMarker',
    'linenWrappings',
    'canopicJars',
    'ritualTablet',
    'oilsResins',
    'exitSeal',
  ].forEach((key) => {
    assert.ok(mummificationChamberInteractionAtlas.regions[key], `${key} should be present in the interaction atlas`);
    assert.match(journeyRenderAssetsSource, new RegExp(`'${key}'`));
  });
  assert.match(journeyRenderAssetsSource, /MUMMIFICATION_CHAMBER_INTERACTIONS_ATLAS_JSON/);
  assert.match(journeyRenderAssetsSource, /MUMMIFICATION_CHAMBER_INTERACTIONS:\s*'mummification-chamber-interactions'/);
  assert.match(journeyComponentSource, /mummificationInteractionAssetsRef = useRef\(createEnvironmentAssetState\(ENVIRONMENT_ASSET_PACK_IDS\.MUMMIFICATION_CHAMBER_INTERACTIONS\)\)/);
  assert.match(journeyComponentSource, /loadEnvironmentAssetPack\(\{[\s\S]*?packId:\s*ENVIRONMENT_ASSET_PACK_IDS\.MUMMIFICATION_CHAMBER_INTERACTIONS/);
  assert.match(journeyUtilsSource, /mummificationChamberInspectedObjectIds:\s*new Set\(\)/);
  assert.match(journeyComponentSource, /MUMMIFICATION_CHAMBER_INTERACTION_OBJECTS = Object\.freeze/);
  [
    'This was a work of care. Every hand here moved slowly, and in silence.',
    'Layer by layer. Not hidden. Held together.',
    'Not storage. Safekeeping.',
    'The name has been scratched away. Someone tried to remove more than stone.',
    'Preservation was care. Not display.',
    'The seal recognises care before passage.',
    'The scent of resin rises from the stone.',
    'The linen settles, smooth and patient under careful hands.',
    'The jars settle into silence.',
    'A faint line of the name returns.',
    'The chamber grows still.',
  ].forEach((line) => {
    assert.match(journeyComponentSource, new RegExp(line.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });
  // Tone guard: the chamber copy must avoid the early "memory" framing.
  [
    'the self being carried across',
    'remembering its purpose',
    'buried with memories',
  ].forEach((banned) => {
    assert.doesNotMatch(journeyComponentSource, new RegExp(banned.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });
  assert.match(journeyComponentSource, /current\.mummificationChamberPuzzleSolved = true/);
  assert.match(journeyComponentSource, /current\.mummificationChamberExitUnlocked = true/);
  assert.match(journeyComponentSource, /drawAtlasRegion\(ctx, interactionAssets, item\.assetKey/);
  assert.doesNotMatch(journeyComponentSource, /createMummificationInteractionSystem|MummificationInteractionObjects\.jsx|class\s+MummificationInteraction/);
});

test('mummification chamber ritual-order puzzle uses in-world sequence activation and safely unlocks the exit', () => {
  [
    'Cleanse the body',
    'Remove organs and dry the body',
    'Anoint with oils and resins',
    'Wrap body in linen',
    'Place in sarcophagus with amulets',
  ].forEach((step) => {
    assert.match(journeyComponentSource, new RegExp(step.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });
  assert.match(journeyComponentSource, /MUMMIFICATION_CHAMBER_PUZZLE = \{/);
  assert.match(journeyComponentSource, /type:\s*'mummification-ritual-order-puzzle'/);
  assert.match(journeyComponentSource, /MUMMIFICATION_CHAMBER_RITUAL_SEQUENCE/);
  assert.match(journeyComponentSource, /mummificationChamberRitualStep/);
  assert.match(journeyComponentSource, /That order is not right\./);
  assert.match(journeyComponentSource, /The ritual order is understood\./);
  // The room is now a physical rite system driven by the reusable interact model.
  assert.match(journeyComponentSource, /MUMMIFICATION_ROOM_INTERACT_VERSION = 'mummification-room-interact-system-2026-06-05'/);
  assert.match(journeyComponentSource, /The seal does not trust an unfinished rite\./);
  assert.match(journeyComponentSource, /The scratched mark glows\. The seal opens\./);
  assert.match(journeyComponentSource, /The name is set right\. Anubis says nothing\./);
  assert.match(journeyComponentSource, /The scent of resin rises from the stone\./);
  assert.match(journeyComponentSource, /current\.mummificationChamberPuzzleSolved = true/);
  assert.match(journeyComponentSource, /current\.mummificationChamberExitUnlocked = true/);
  assert.match(journeyComponentSource, /ritualStep > 0 \? 'ritual-active'/);
  assert.match(journeyComponentSource, /The Ritual of Preservation/);
  assert.doesNotMatch(journeyComponentSource, /createMummificationPuzzleSystem|MummificationPuzzle\.jsx|class\s+MummificationPuzzle/);
});

test('mummification chamber ritual puzzle teaches the next rite without punishing progress', () => {
  assert.match(journeyComponentSource, /MUMMIFICATION_CHAMBER_RITUAL_GUIDANCE_VERSION = 'mummification-ritual-guided-sequence-2026-05-31'/);
  [
    ['mummification-embalming-table', 'Cleanse the body'],
    ['mummification-canopic-jars', 'Remove organs and dry the body'],
    ['mummification-oils-resins', 'Anoint with oils and resins'],
    ['mummification-linen-wrappings', 'Wrap body in linen'],
    ['mummification-ritual-tablet', 'Place in sarcophagus with amulets'],
  ].forEach(([id, rite]) => {
    assert.match(journeyComponentSource, new RegExp(`id:\\s*'${id}'[\\s\\S]*?rite:\\s*'${rite.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`));
  });
  assert.match(journeyComponentSource, /MUMMIFICATION_CHAMBER_RITUAL_SEQUENCE = MUMMIFICATION_CHAMBER_RITUAL_STEPS\.map\(step => step\.id\)/);
  assert.match(journeyComponentSource, /currentStepInfo = MUMMIFICATION_CHAMBER_RITUAL_STEPS\[chamberRitualStep\]/);
  // Wrong placement teaches via a clue + flicker and never resets prior progress.
  assert.match(journeyComponentSource, /riteDef\.wrongTargetNotice/);
  assert.match(journeyComponentSource, /That jar does not belong here\. Match the symbol to the plinth\./);
  assert.match(journeyComponentSource, /One careless hand can undo centuries/);
  assert.doesNotMatch(journeyComponentSource, /current\.mummificationChamberRitualStep = 0;[\s\S]*?MUMMIFICATION_CHAMBER_RITUAL_SEQUENCE\.forEach\(\(id\) => inspectedObjectIds\.delete\(id\)\)/);
});

test('reusable Journey Room Interact system drives the mummification chamber with physical verbs', () => {
  // Reusable primitives live in the existing helper area, not a parallel folder.
  assert.match(journeyUtilsSource, /export const JOURNEY_INTERACT_VERBS = Object\.freeze/);
  assert.match(journeyUtilsSource, /export const JOURNEY_INTERACT_OBJECT_STATES = Object\.freeze/);
  assert.match(journeyUtilsSource, /export const JOURNEY_INTERACT_PROMPTS = Object\.freeze/);
  ['INSPECT', 'PICK_UP', 'CARRY', 'PLACE', 'HOLD_APPLY', 'HOLD_WRAP', 'RESTORE'].forEach((verb) => {
    assert.match(journeyUtilsSource, new RegExp(`${verb}:`));
  });
  ['IDLE', 'INSPECTED', 'HELD', 'PLACED', 'USED', 'COMPLETED', 'LOCKED'].forEach((state) => {
    assert.match(journeyUtilsSource, new RegExp(`${state}:`));
  });
  assert.match(journeyUtilsSource, /export const createJourneyRoomInteractionState = /);
  assert.match(journeyUtilsSource, /export const journeyInteractPickUp = /);
  assert.match(journeyUtilsSource, /export const journeyInteractPlace = /);
  assert.match(journeyUtilsSource, /export const journeyInteractHoldTick = /);
  assert.match(journeyUtilsSource, /export const MUMMIFICATION_RITE_SEQUENCE = /);
  // One carried item at a time + wrong-target keeps progress, encoded in the helper.
  assert.match(journeyUtilsSource, /if \(next\.carriedItemId\) \{/);
  assert.match(journeyUtilsSource, /reason: 'hands-full'/);
  assert.match(journeyUtilsSource, /reason: 'wrong-target'/);

  // The chamber state lives in the existing Journey flow and is wired into the room.
  assert.match(journeyUtilsSource, /mummificationChamberInteraction: createJourneyRoomInteractionState\(\)/);
  assert.match(journeyComponentSource, /MUMMIFICATION_CHAMBER_RITE_OBJECTS = MUMMIFICATION_CHAMBER_RITES/);
  assert.match(journeyComponentSource, /MUMMIFICATION_HOLD_DURATIONS = Object\.freeze\(\{ apply:/);
  // The four canopic jars and their scrambled plinths.
  ['jar-imsety', 'jar-hapi', 'jar-duamutef', 'jar-qebehsenuef'].forEach((id) => {
    assert.match(journeyComponentSource, new RegExp(`id: '${id}'`));
  });
  ['plinth-a', 'plinth-b', 'plinth-c', 'plinth-d'].forEach((id) => {
    assert.match(journeyComponentSource, new RegExp(`id: '${id}'`));
  });
  // Real interact key (plain E), with the dev prop editor moved to Shift+E.
  assert.match(journeyComponentSource, /const interactDown = !!keys\.KeyE/);
  assert.match(journeyComponentSource, /event\.code === 'KeyE' && event\.shiftKey/);
  // Hold-to-use and carry are routed through the reusable primitives.
  assert.match(journeyComponentSource, /journeyInteractHoldTick\(interaction/);
  assert.match(journeyComponentSource, /journeyInteractPickUp\(interaction/);
  assert.match(journeyComponentSource, /journeyInteractPlace\(interaction/);
  // Polish: each rite shows a short action hint, and carrying the wrong item to a
  // hold target gives the clue instead of failing silently.
  [
    'Carry each jar to the plinth with its matching symbol.',
    'One vessel calms the room. The others do not.',
    'Hold E at the table to wrap — stay still or the linen slips.',
  ].forEach((hint) => {
    assert.match(journeyComponentSource, new RegExp(hint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });
  assert.match(journeyComponentSource, /isHoldTarget\(target\) && carried && carried !== target\.acceptsItemId/);

  // Story-lock upgrade: cold Anubis on careless hands, a chamber that "stirs",
  // three oils (one calms), and a three-fragment damaged-name ordering.
  assert.match(journeyComponentSource, /MUMMIFICATION_ANUBIS_WARNINGS = Object\.freeze/);
  assert.match(journeyComponentSource, /One careless hand can undo centuries\./);
  assert.match(journeyComponentSource, /A name scratched from stone is not silence\. It is a wound\./);
  assert.match(journeyComponentSource, /const stirChamber = /);
  assert.match(journeyComponentSource, /mummificationChamberDisturbanceTimer/);
  ['oil-common', 'oil-bitter', 'oil-sacred'].forEach((id) => {
    assert.match(journeyComponentSource, new RegExp(`id: '${id}'`));
  });
  ['name-frag-1', 'name-frag-2', 'name-frag-3', 'name-slot-1', 'name-slot-2', 'name-slot-3'].forEach((id) => {
    assert.match(journeyComponentSource, new RegExp(`id: '${id}'`));
  });
  assert.match(journeyComponentSource, /The flame recoils\. This is not the sacred resin\./);
  assert.match(journeyComponentSource, /The scent turns bitter\. The chamber stirs\./);
  assert.match(journeyComponentSource, /This name was not worn by time\. It was scratched out by hand\./);
  // Matching is genuine inference now — the old "correct target" auto-glow is gone.
  assert.doesNotMatch(journeyComponentSource, /const validTarget = Boolean\(carriedId\)/);
  // No parallel room / puzzle / interaction system was created.
  assert.doesNotMatch(journeyComponentSource, /createMummificationRoomSystem|JourneyRoomInteract\.jsx|class\s+JourneyRoomInteract/);
});

test('mummification chamber atmosphere wakes from existing inspection and puzzle state', () => {
  assert.match(journeyComponentSource, /MUMMIFICATION_CHAMBER_ATMOSPHERE_VERSION = 'mummification-chamber-atmosphere-progression-2026-05-28'/);
  assert.match(journeyComponentSource, /getMummificationChamberAtmosphere = \(current\) => \{/);
  assert.match(journeyComponentSource, /mummificationChamberInspectedObjectIds/);
  assert.match(journeyComponentSource, /mummificationChamberRitualStep/);
  assert.match(journeyComponentSource, /ritualRatio/);
  assert.match(journeyComponentSource, /mummificationChamberPuzzleSolved \|\| current\.mummificationChamberExitUnlocked/);
  assert.match(journeyComponentSource, /particleCount:\s*Math\.min\(40,/);
  assert.match(journeyComponentSource, /disturbance/);
  assert.match(journeyComponentSource, /wakeProgress/);
  assert.match(journeyComponentSource, /glyphGlowAlpha/);
  assert.match(journeyComponentSource, /linenMotion/);
  assert.match(journeyComponentSource, /mummificationChamberAtmosphereVersion/);
  assert.match(journeyComponentSource, /mummificationChamberWakeProgress/);
  assert.match(journeyComponentSource, /mummificationChamberParticleCount/);
  assert.doesNotMatch(journeyComponentSource, /createMummificationAtmosphereSystem|MummificationAtmosphere\.jsx|class\s+MummificationAtmosphere/);
});

test('world continuity landmarks foreshadow future expedition sections', () => {
  const worldLandmarks = extractExportedArray('WORLD_CONTINUITY_LANDMARKS');
  const transitionMarkers = extractExportedArray('WORLD_TRANSITION_STORY_MARKERS');
  const stageEntranceFeatures = extractExportedArray('STAGE_ENTRANCE_FEATURES');

  assert.ok((worldLandmarks.match(/id:/g) || []).length >= 8);
  ['tower', 'mountains', 'excavation-camp', 'guardian-ruin', 'bridge', 'gate'].forEach((type) => {
    assert.match(worldLandmarks, new RegExp(`type:\\s*'${type}'`));
  });
  ['ruined-temple', 'catacombs', 'escape-sequence', 'dig-site-entrance'].forEach((sectionId) => {
    assert.match(worldLandmarks, new RegExp(`foreshadows:\\s*'${sectionId}'`));
  });
  assert.match(worldLandmarks, /larger-expedition-world/);
  assert.ok((transitionMarkers.match(/id:/g) || []).length >= 4);
  assert.match(transitionMarkers, /collapsed road leading to the temple doors/);
  assert.match(transitionMarkers, /camp lamps and carved stone over the final rise/);

  assert.equal((stageEntranceFeatures.match(/^\s{4}id:/gm) || []).length, 4);
  [
    'ruined-temple-colossus-gate',
    'catacomb-descent-doorway',
    'escape-breach-gate',
    'dig-site-arrival-gate',
  ].forEach((id) => {
    assert.match(stageEntranceFeatures, new RegExp(`id:\\s*'${id}'`));
  });
  ['ruined-temple', 'catacombs', 'escape-sequence', 'dig-site-entrance'].forEach((sectionId) => {
    assert.match(stageEntranceFeatures, new RegExp(`to:\\s*'${sectionId}'`));
  });
  assert.match(stageEntranceFeatures, /type:\s*'tomb-doorway'/);
  assert.match(stageEntranceFeatures, /id:\s*'ruined-temple-colossus-gate'[\s\S]*?yOffset:\s*13/);
  assert.match(stageEntranceFeatures, /id:\s*'ruined-temple-colossus-gate'[\s\S]*?permanentStructure:\s*true/);
  assert.match(stageEntranceFeatures, /width:\s*1260/);
  assert.match(stageEntranceFeatures, /height:\s*630/);
  assert.match(stageEntranceFeatures, /focusDistance:\s*560/);
  assert.match(journeyComponentSource, /STAGE_ENTRANCE_DOORWAY_SRC = 'assets\/expedition\/environment\/stage-entrances\/egypt-tomb-doorway-transition\.png'/);
  assert.match(journeyComponentSource, /STAGE_ENTRANCE_DOORWAY_VERSION = 'imagegen-egypt-tomb-doorway-transition-2026-05-20'/);
  assert.match(journeyComponentSource, /DESERT_END_GATEWAY_VERSION = 'imagegen-desert-end-threshold-angled-blended-2026-05-23'/);
  assert.match(journeyComponentSource, /stageEntranceDoorwayRef/);
  assert.match(journeyComponentSource, /Math\.min\(0,\s*CANVAS_HEIGHT - height\) \+ \(feature\.yOffset \|\| 0\)/);
  assert.match(journeyComponentSource, /ctx\.drawImage\(doorwayAsset\.image/);
  assert.match(journeyComponentSource, /const permanentStructure = Boolean\(feature\.permanentStructure\)/);
  assert.match(journeyComponentSource, /if \(!permanentStructure\) \{[\s\S]*?drawContactShadow\(ctx, centerX, floorY \+ 2, width \* 0\.62, 0\.28, 1\.22\)/);
  assert.match(journeyComponentSource, /if \(!permanentStructure\) \{[\s\S]*?const vignette = ctx\.createRadialGradient[\s\S]*?ctx\.ellipse\(doorwayCenterX, doorwayCenterY, doorwayRadiusX, doorwayRadiusY/);
  assert.match(journeyComponentSource, /mode:\s*'stage-entrance'/);
  assert.match(journeyComponentSource, /nearbyStageEntrance\.x - CANVAS_WIDTH \* 0\.5/);
  assert.match(journeyComponentSource, /drawStageEntranceFeature/);
  assert.match(journeyComponentSource, /isStageEntrancePastArrivalForState/);
  assert.match(journeyComponentSource, /shouldRenderStageEntranceFeatureForState/);
  assert.match(journeyComponentSource, /playerSectionId === feature\.to/);
  assert.match(journeyComponentSource, /STAGE_ENTRANCE_FEATURES\.forEach/);
});

test('developer tools can jump to the start of every journey section', () => {
  const sections = extractExportedArray('SECTIONS');

  assert.match(devToolsSource, /import\s+\{\s*SECTIONS\s*\}\s+from\s+'\.\/expedition-journey\/journeyDataRouter'/);
  assert.match(devToolsSource, /JOURNEY_SECTION_DEV_JUMPS\s*=\s*SECTIONS\.map/);
  assert.match(devToolsSource, /jumpToExpeditionStage\('journey-section-start'/);
  assert.match(devToolsSource, /sectionId:\s*jump\.id/);
  assert.match(devToolsSource, /Journey Starts/);

  assert.match(expeditionModeSource, /event\.detail\?\.target === 'journey-section-start'/);
  assert.match(journeyComponentSource, /handleExpeditionDevJump/);
  assert.match(journeyComponentSource, /target !== 'journey-section-start'/);
  assert.match(journeyComponentSource, /SECTIONS\.find\(section => section\.id === sectionId\)/);
  assert.match(journeyComponentSource, /sectionCheckpoint = getRenderableCheckpoints\(\)\.find\(checkpoint => checkpoint\.id === section\.id\)/);
  assert.match(journeyComponentSource, /const jumpX = sectionCheckpoint\?\.x \?\? section\.start \+ 24/);
  assert.match(journeyComponentSource, /current\.activeCheckpoint = sectionCheckpoint \|\| current\.activeCheckpoint/);
  assert.match(journeyComponentSource, /current\.completedObjectiveIds\.add\(item\.id\)/);
  assert.match(journeyComponentSource, /current\.openedRouteGateIds\.add\(gate\.id\)/);

  ['desert-entry', 'ruined-temple', 'catacombs', 'escape-sequence', 'dig-site-entrance'].forEach((sectionId) => {
    assert.match(sections, new RegExp(`id:\\s*'${sectionId}'`));
  });
});

test('story props include recurring expedition markers across sections', () => {
  const storyProps = extractExportedArray('STORY_PROPS');

  assert.doesNotMatch(storyProps, /survey-flag-marker/);
  assert.doesNotMatch(storyProps, /opening-footprint-trail/);
  assert.doesNotMatch(storyProps, /opening-threshold-offering/);
  assert.doesNotMatch(storyProps, /upper-route-broken-stone-cue/);
  assert.doesNotMatch(storyProps, /distant-ruins/);
  assert.doesNotMatch(storyProps, /atmosphere-entry-distant-rubble/);
  assert.doesNotMatch(storyProps, /atmosphere-entry-far-door-frame/);
  assert.doesNotMatch(storyProps, /abandoned-camp/);
  assert.doesNotMatch(storyProps, /type:\s*'cart'/);
  assert.match(storyProps, /generated premium carved fallen column in open sand after the pyramid/);
  assert.match(storyProps, /base camp supply chest replacing old cart marker/);
  assert.match(journeyComponentSource, /STORY_PROP_GROUNDING_OVERRIDES/);
  assert.doesNotMatch(journeyComponentSource, /'upper-route-broken-stone-cue':\s*\{/);
  assert.match(journeyComponentSource, /'jackal-statue':\s*\{[\s\S]*?alpha:\s*0\.96[\s\S]*?depth:\s*'midground'/);
  assert.match(journeyComponentSource, /STORY_PROP_GROUNDING_OVERRIDES\[prop\.id\]\?\.depth/);
  assert.match(journeyComponentSource, /propSize\.bury/);
  assert.match(journeyComponentSource, /useNaturalUpperRouteHint/);
  assert.match(journeyComponentSource, /route\.id === 'desert-upper-survey-route'/);
});

test('Ancient Egypt opening stages archaeologist arrival and warrior-guide story with existing Journey systems', () => {
  const storyProps = extractExportedArray('STORY_PROPS');
  const events = extractExportedArray('ENVIRONMENT_EVENTS');
  const routeGates = extractExportedArray('ROUTE_GATES');
  const miniBosses = extractExportedArray('MINI_BOSSES');
  const bossKeyItems = extractExportedArray('BOSS_KEY_ITEMS');

  assert.match(storyProps, /id:\s*'opening-archaeologist-field-kit'/);

  assert.doesNotMatch(storyProps, /id:\s*'opening-sacred-threshold-guardian'/);
  assert.match(storyProps, /id:\s*'desert-entry-premium-column-1'/);
  ['camp', 'ceremonial-offering', 'sacred-pedestal'].forEach((type) => {
    assert.match(storyProps, new RegExp(`type:\\s*'${type}'`));
  });

  assert.match(events, /id:\s*'opening-archaeologist-arrival'/);
  assert.match(events, /The expedition reaches a huge sealed Egyptian site\./);
  assert.match(events, /id:\s*'opening-guardian-challenge'/);
  assert.match(events, /Anubis watches from the seal\. The site will not open without proof\./);
  assert.match(events, /id:\s*'opening-warrior-guide-entry'/);
  assert.match(events, /Asha guards the route toward excavation\./);
  assert.match(events, /id:\s*'relic-shard-purpose-note-read'/);
  assert.match(events, /Restore the fragments the seal still recognises\. Pass the guardians\. The site will test you\./);
  assert.match(events, /id:\s*'opening-guide-careful-tools'/);
  assert.match(events, /Good\. Evidence and tools open the path - not force\./);
  assert.match(events, /id:\s*'opening-sacred-threshold-watch'/);
  assert.match(events, /The guardian watches\. Prove you can move with care\./);
  assert.match(events, /card:\s*false/);
  assert.match(journeyComponentSource, /current\.cameraShakeTimer = ev\.duration \* 0\.4;/);
  assert.match(journeyComponentSource, /current\.cameraShakeStrength = ev\.shake;/);
  assert.match(journeyComponentSource, /cameraShakeActive: current\.cameraShakeTimer > 0/);

  assert.match(routeGates, /id:\s*'temple-approach-seal'[\s\S]*?requires:\s*\{[\s\S]*?shards:\s*4/);
  assert.match(routeGates, /The Temple Approach Seal refuses easy entry\. The lost fragments must prove Asha came to protect\./);
  assert.match(routeGates, /readyHint:\s*'The seal answers\. Move through the threshold before the site closes again\.'/);
  assert.match(routeGates, /openMessage:\s*'The seal answers, but it does not trust you\.'/);
  assert.match(routeGates, /id:\s*'guardian-prep-seal'[\s\S]*?requires:\s*\{\s*objective:\s*'desert-entry'[\s\S]*?shards:\s*6/);
  assert.match(routeGates, /Sealed\. Read the Lost Map Tablet \(behind you in the desert\) and restore 6 relic fragments to pass\./);
  assert.match(routeGates, /id:\s*'desert-seal'[\s\S]*?requires:\s*\{\s*objective:\s*'desert-entry',\s*miniBoss:\s*'scarab-queen',\s*keyItem:\s*'brush-handle',\s*shards:\s*10/);
  assert.match(routeGates, /The Desert Map Seal waits for the Map Tablet, the Brush Handle, the fall of the Scarab Queen, and 10 lost fragments\./);
  assert.match(routeGates, /Carry the record forward into the ruined temple\./);
  assert.match(miniBosses, /id:\s*'scarab-queen'[\s\S]*?health:\s*2,\s*damage:\s*7/);
  assert.match(miniBosses, /The buried scarab lair splits open beneath the sand\. The Scarab Queen rises as the first trial of Anubis\. The site will not yield easily\./);
  assert.match(bossKeyItems, /id:\s*'brush-handle'[\s\S]*?The Scarab Queen falls\. Asha has permission, not trust\. Brush Handle recovered\. The Desert Map Seal answers\./);
  assert.match(journeyComponentSource, /const GUARDIAN_KNOWLEDGE_CHALLENGES_ENABLED = false;/);
});

test('Expedition framing presents Journey, Base Camp, and excavation as in-world adventure systems', () => {
  [
    'What to do first',
    'Find and read the Lost Map Tablet',
    'Collect relic shards along the route',
    'Use shards to open sealed paths',
    'Defeat the first guardian',
    'Reach Base Camp',
    'Relic shards',
  ].forEach((copy) => assert.match(journeyComponentSource, new RegExp(copy)));
  assert.match(journeyComponentSource, /<JourneyControlsReference compactMovementKeys \/>/);

  [
    'Opening objective',
    'Base Camp shards',
  ].forEach((copy) => assert.doesNotMatch(journeyComponentSource, new RegExp(copy)));

  [
    'The Temple Approach Seal refuses easy entry. The lost fragments must prove Asha came to protect.',
    'Restore the fragments the seal still recognises. Pass the guardians. The site will test you.',
    'The site has judged Asha before she has spoken. Restore 4 fragments the seal still recognises.',
    'First fragment restored. Three more will answer the seal.',
    'Restore the fragments the seal still recognises. Pass the guardians. The site will test you.',
    'Seal Test',
  ].forEach((copy) => assert.match(source, new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));

  [
    'First objective',
    'Opening Objective',
    'Base Camp shards',
  ].forEach((copy) => assert.doesNotMatch(source, new RegExp(copy)));

  [
    'Base Camp Outpost',
    'Safe Hub Reached',
    'Working Theory',
    'Expedition Plan',
    'Field Journal',
    'Survey the Site',
    'Mark the Grid',
    'Survey focus',
    'Tool Bench',
    'Relic Table',
    'Route Map',
    'Discovery Log',
  ].forEach((copy) => assert.match(expeditionModeSource, new RegExp(copy)));

  [
    'Base Camp Checklist',
    'Active Mission',
    'Inquiry Question',
    'Field Instructions',
    'Mission Target',
    'Survey Before Digging',
    'Grid Before Excavating',
    'Investigation points (removed)',
    'Antiquities Bureau - Lost Site Expedition',
    'Antiquities Bureau - Site Survey',
    'Antiquities Bureau - Excavation Grid',
    'Antiquities Bureau - Final Claim',
  ].forEach((copy) => assert.doesNotMatch(expeditionModeSource, new RegExp(copy)));

  assert.match(menuSource, /Standalone Adventure/);
  assert.match(menuSource, /Cross the sealed route, face the first guardian, then return to Base Camp Outpost for fieldwork\./);
});

test('Egypt Phase 1 boss identity changes preserve progression ids and China names', () => {
  const miniBosses = extractExportedArray('MINI_BOSSES');
  const chinaMiniBosses = extractExportedArray('CHINA_MINI_BOSSES');
  const bossKeyItems = extractExportedArray('BOSS_KEY_ITEMS');
  const routeGates = extractExportedArray('ROUTE_GATES');

  [
    /id:\s*'scarab-queen'[\s\S]*?name:\s*'Scarab Queen'[\s\S]*?health:\s*2,\s*damage:\s*7[\s\S]*?domainName:\s*'First Guardian Domain'/,
    /id:\s*'temple-guardian'[\s\S]*?name:\s*'Anubis'[\s\S]*?health:\s*2,\s*damage:\s*11[\s\S]*?domainName:\s*'Anubis Gate'/,
    /id:\s*'giant-serpent'[\s\S]*?name:\s*'The Uraeus'[\s\S]*?health:\s*2,\s*damage:\s*11[\s\S]*?domainName:\s*'Uraeus Seal Domain'/,
    /id:\s*'looter-captain'[\s\S]*?name:\s*'Bes'[\s\S]*?health:\s*2,\s*damage:\s*11[\s\S]*?domainName:\s*'Bes Trial'/,
    /id:\s*'ancient-construct'[\s\S]*?name:\s*'The Sphinx'[\s\S]*?health:\s*3,\s*damage:\s*14[\s\S]*?domainName:\s*'Sphinx Gate'/,
  ].forEach((pattern) => assert.match(miniBosses, pattern));

  [
    'The buried scarab lair splits open beneath the sand. The Scarab Queen rises as the first trial of Anubis. The site will not yield easily.',
    'Anubis stands at the temple path. Only those who move with respect may pass.',
    'The Uraeus coils around the sacred seal. The path forward is protected.',
    'Bes blocks the broken passage with a fierce grin. This place will not be rushed.',
    'The Sphinx rises before the expedition site. These artefacts are protected for a reason.',
  ].forEach((text) => assert.match(miniBosses, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));

  [
    /id:\s*'scarab-queen'[\s\S]*?name:\s*'Clay River Guardian'/,
    /id:\s*'temple-guardian'[\s\S]*?name:\s*'Bronze Gate Warden'/,
    /id:\s*'giant-serpent'[\s\S]*?name:\s*'Jade Seal Guardian'/,
    /id:\s*'looter-captain'[\s\S]*?name:\s*'Archive Sentry Captain'/,
    /id:\s*'ancient-construct'[\s\S]*?name:\s*'Rammed-Earth Sentinel'/,
  ].forEach((pattern) => assert.match(chinaMiniBosses, pattern));

  [
    /id:\s*'brush-handle'[\s\S]*?bossId:\s*'scarab-queen'[\s\S]*?gateId:\s*'desert-seal'/,
    /id:\s*'trowel-blade'[\s\S]*?bossId:\s*'temple-guardian'[\s\S]*?gateId:\s*'temple-seal'/,
    /id:\s*'measuring-cord'[\s\S]*?bossId:\s*'giant-serpent'[\s\S]*?gateId:\s*'catacomb-seal'/,
    /id:\s*'field-notebook-clasp'[\s\S]*?bossId:\s*'looter-captain'[\s\S]*?gateId:\s*'escape-seal'/,
    /id:\s*'site-permit-seal'[\s\S]*?bossId:\s*'ancient-construct'[\s\S]*?gateId:\s*'basecamp-seal'/,
  ].forEach((pattern) => assert.match(bossKeyItems, pattern));

  assert.match(routeGates, /id:\s*'desert-seal'[\s\S]*?requires:\s*\{\s*objective:\s*'desert-entry',\s*miniBoss:\s*'scarab-queen',\s*keyItem:\s*'brush-handle',\s*shards:\s*10/);
  assert.match(routeGates, /id:\s*'temple-seal'[\s\S]*?miniBoss:\s*'temple-guardian'[\s\S]*?keyItem:\s*'trowel-blade'/);
  assert.match(routeGates, /id:\s*'catacomb-seal'[\s\S]*?miniBoss:\s*'giant-serpent'[\s\S]*?keyItem:\s*'measuring-cord'/);
  assert.match(routeGates, /id:\s*'escape-seal'[\s\S]*?miniBoss:\s*'looter-captain'[\s\S]*?keyItem:\s*'field-notebook-clasp'/);
  assert.match(routeGates, /id:\s*'basecamp-seal'[\s\S]*?miniBoss:\s*'ancient-construct'[\s\S]*?keyItem:\s*'site-permit-seal'/);
});

test('Anubis boss uses the approved Anubis sprite atlas through the existing temple-guardian slot', () => {
  assert.match(
    journeyBossSpritesSource,
    /STONE_GUARDIAN_SPRITE_ATLAS_JSON\s*=\s*`\$\{BOSS_SPRITE_BASE_PATH\}anubis-sprites\.json`/,
  );
  assert.equal(anubisBossAtlas.image, 'anubis-sprites.png');
  assert.equal(anubisBossAtlas.status, 'approved-for-journey-wiring');
  [
    'stoneGuardianIdle',
    'stoneGuardianWalk1',
    'stoneGuardianWalk2',
    'stoneGuardianAwakening',
    'stoneGuardianWindup',
    'stoneGuardianSlam',
    'stoneGuardianShockwave',
    'stoneGuardianShielded',
    'stoneGuardianCounterWindow',
    'stoneGuardianHit',
    'stoneGuardianDefeated',
  ].forEach((key) => {
    const target = anubisBossAtlas.journeyAliasContract[key];
    assert.ok(target, `${key} should alias to an Anubis frame`);
    assert.deepEqual(anubisBossAtlas.regions[key], anubisBossAtlas.regions[target]);
  });
});

test('Bes uses a dedicated guardian sprite pack through the existing mini-boss slot', () => {
  const miniBosses = extractExportedArray('MINI_BOSSES');

  assert.match(miniBosses, /id:\s*'looter-captain'[\s\S]*?name:\s*'Bes'/);
  assert.match(miniBosses, /id:\s*'looter-captain'[\s\S]*?type:\s*'bes'/);
  assert.match(
    journeyEnemySpritesSource,
    /BES_GUARDIAN_SPRITE_ATLAS_JSON\s*=\s*`\$\{ENEMY_SPRITE_BASE_PATH\}bes-guardian-sprites\.json`/,
  );
  assert.match(journeyEnemySpritesSource, /besGuardian:\s*\{[\s\S]*?atlasPath:\s*BES_GUARDIAN_SPRITE_ATLAS_JSON/);
  assert.match(journeyEnemySpritesSource, /if \(enemy\.type === 'bes' \|\| name\.includes\('bes'\)\) return 'besGuardian';/);
  assert.match(journeyComponentSource, /boss\.type === 'looter' \|\| boss\.type === 'bes'/);
  assert.equal(besEnemyAtlas.image, 'bes-guardian-sprites.png');
  [
    'besGuardianIdle',
    'besGuardianWalk1',
    'besGuardianWalk2',
    'besGuardianWalk3',
    'besGuardianWindup',
    'besGuardianAttack',
    'besGuardianHit',
    'besGuardianDefeated',
  ].forEach((key) => {
    assert.ok(besEnemyAtlas.regions[key], `${key} should exist in the Bes atlas`);
  });
});

test('opening Scarab Seal becomes a restrained false-discovery threshold scene', () => {
  const storyProps = extractExportedArray('STORY_PROPS');
  const platforms = extractExportedArray('PLATFORMS');
  const routeGates = extractExportedArray('ROUTE_GATES');
  const miniBosses = extractExportedArray('MINI_BOSSES');
  const bossKeyItems = extractExportedArray('BOSS_KEY_ITEMS');
  const events = extractExportedArray('ENVIRONMENT_EVENTS');
  const hazards = extractExportedArray('HAZARDS');

  assert.match(source, /export const SCARAB_SEAL_TRIGGER = \{/);
  assert.match(source, /id:\s*'scarab-seal-trigger'/);
  assert.match(source, /name:\s*'Sacred Scarab Seal'/);
  assert.doesNotMatch(platforms, /invisible lower pyramid roof ledge/i);
  assert.doesNotMatch(platforms, /invisible middle pyramid terrace ledge/i);
  assert.doesNotMatch(platforms, /invisible middle pyramid roof ledge/i);
  assert.doesNotMatch(platforms, /invisible upper pyramid terrace ledge/i);
  assert.doesNotMatch(platforms, /invisible scarab artefact ledge/i);
  assert.doesNotMatch(platforms, /lower pyramid stair tread/i);
  assert.doesNotMatch(platforms, /carved pressure stair slab/i);
  assert.doesNotMatch(platforms, /upper lower-stair tread/i);
  assert.doesNotMatch(platforms, /upper pyramid stair helper/i);
  assert.doesNotMatch(platforms, /cracked summit trap slab/i);
  assert.doesNotMatch(storyProps, /id:\s*'early-scarab-seal-pedestal'/);
  assert.doesNotMatch(storyProps, /id:\s*'early-scarab-seal'/);
  assert.match(journeyComponentSource, /'early-scarab-seal':\s*\{[\s\S]*?width:\s*38[\s\S]*?height:\s*38[\s\S]*?yOffset:\s*0/);
  assert.match(journeyComponentSource, /OPENING_SCARAB_SEAL_IMAGE_SRC = 'assets\/expedition\/environment\/egypt-opening\/scarab-seal-ground-embedded\.png'/);
  assert.match(journeyComponentSource, /openingScarabSealImageRef/);
  const openingPyramidFacadeSource = getComponentFunctionSource('drawOpeningPyramidFacade');
  assert.doesNotMatch(journeyComponentSource, /getOpeningScarabSealGlowAnchor = useCallback/);
  assert.doesNotMatch(journeyComponentSource, /getRenderableStoryProps\(current\)\.find\(prop => prop\.id === 'early-scarab-seal'\)/);
  assert.doesNotMatch(journeyComponentSource, /getStoryPropEditorBounds\(openingScarabSealProp, cameraX, current\)/);
  assert.doesNotMatch(openingPyramidFacadeSource, /const glowAnchor = getOpeningScarabSealGlowAnchor\(stateRef\.current, cameraX\)/);
  assert.doesNotMatch(openingPyramidFacadeSource, /glowAnchor\.x/);
  assert.doesNotMatch(openingPyramidFacadeSource, /glowAnchor\.y/);
  assert.doesNotMatch(openingPyramidFacadeSource, /const scarabSealX = worldToScreenX\(SCARAB_SEAL_TRIGGER\.x, cameraX\)/);
  assert.doesNotMatch(openingPyramidFacadeSource, /const beaconY = SCARAB_SEAL_TRIGGER\.y - 44/);
  assert.doesNotMatch(openingPyramidFacadeSource, /sealHaloGradient/);
  assert.doesNotMatch(openingPyramidFacadeSource, /ctx\.ellipse\(scarabSealX, beaconY, radiusX \* 1\.16, radiusY \* 1\.22/);
  assert.doesNotMatch(openingPyramidFacadeSource, /ctx\.setLineDash\(\[10, 14\]\)/);
  assert.doesNotMatch(openingPyramidFacadeSource, /drawOpeningPyramidAssetRegion\(ctx,\s*'pedestal'/);
  assert.doesNotMatch(openingPyramidFacadeSource, /drawOpeningPyramidAssetRegion\(ctx,\s*'seal'/);
  assert.match(journeyComponentSource, /'opening-seal-reset-trap':\s*'spikeTrap'/);
  assert.doesNotMatch(journeyComponentSource, /ctx\.drawImage\(trapSealImage\.image/);
  assert.match(events, /id:\s*'opening-scarab-seal-climb'/);
  assert.match(events, /id:\s*'opening-scarab-seal-climb'[\s\S]*?x:\s*X\(95\)/);

  assert.match(journeyUtilsSource, /scarabSealActivated:\s*false/);
  assert.match(journeyComponentSource, /scarabSealState:/);
  assert.match(journeyComponentSource, /current\.scarabSealActivated = true/);
  assert.match(journeyComponentSource, /current\.openingConfrontationSeen = true/);
  assert.match(journeyComponentSource, /current\.openingThresholdScene = \{/);
  assert.match(journeyComponentSource, /phase:\s*'false-discovery'/);
  assert.match(journeyComponentSource, /lockMovement:\s*true/);
  assert.match(journeyComponentSource, /transitionTargetSectionId:\s*'desert-entry'/);
  assert.match(journeyComponentSource, /OPENING_THRESHOLD_SCENE_DURATION = 14/);
  assert.match(journeyComponentSource, /OPENING_THRESHOLD_FADE_SECONDS = 1\.2/);
  assert.match(journeyComponentSource, /OPENING_THRESHOLD_STAIR_REVEAL_SECONDS = 3\.8/);
  assert.match(journeyComponentSource, /drawOpeningThresholdScene/);
  assert.match(journeyComponentSource, /getOpeningThresholdDialogueLine/);
  assert.match(journeyComponentSource, /current\.openingThresholdScene\.timer/);
  assert.match(journeyComponentSource, /completeOpeningThresholdScene\(current\)/);
  assert.match(journeyComponentSource, /window\.__setExpeditionOpeningThresholdTimer/);
  assert.match(journeyComponentSource, /openingCheckpoint.*getRenderableCheckpoints\(\)\.find\(checkpoint => checkpoint\.id === 'desert-entry'\)/);
  assert.match(journeyComponentSource, /current\.activeCheckpoint = openingCheckpoint/);
  assert.match(journeyComponentSource, /current\.sectionTransition = null/);
  assert.match(journeyComponentSource, /current\.lastSectionId = openingSection\?\.id \|\| 'desert-entry'/);
  assert.doesNotMatch(journeyComponentSource, /current\.openedRouteGateIds\.add\('temple-approach-seal'\)/);
  assert.doesNotMatch(journeyComponentSource, /current\.seenBossIntroIds\.add\(SCARAB_SEAL_TRIGGER\.bossId\)/);
  assert.match(journeyComponentSource, /current\.collapsedPlatformIds\.add\('opening-scarab-seal-summit'\)/);
  assert.match(journeyComponentSource, /current\.triggeredEnvironmentEventIds\.add\(SCARAB_SEAL_TRIGGER\.id\)/);
  assert.match(journeyComponentSource, /message:\s*SCARAB_SEAL_TRIGGER\.sealEmphasisMessage/);
  assert.match(journeyComponentSource, /current\.openingCameraRevealDuration = SCARAB_SEAL_TRIGGER\.cameraRevealDuration/);
  assert.match(journeyComponentSource, /current\.openingCameraRevealTimer = Math\.max\(current\.openingCameraRevealTimer \|\| 0, SCARAB_SEAL_TRIGGER\.cameraRevealDuration\)/);
  assert.match(journeyComponentSource, /SCARAB_SEAL_TRIGGER\.sealPulseLabel/);
  assert.match(journeyComponentSource, /current\.arrivalThresholdActive = true/);
  assert.match(journeyComponentSource, /current\.notice = ARRIVAL_THRESHOLD_OBJECTIVE_LINE/);
  assert.match(journeyComponentSource, /id:\s*'arrival-threshold-spawn'/);
  assert.match(journeyUtilsSource, /openingFirstShardEchoSeen:\s*false/);
  assert.match(journeyComponentSource, /current\.scarabSealActivated[\s\S]*?!current\.openingFirstShardEchoSeen[\s\S]*?current\.relicShardCount === 1/);
  assert.match(journeyComponentSource, /current\.openingFirstShardEchoSeen = true;/);
  assert.match(journeyComponentSource, /id:\s*'opening-first-shard-echo'/);
  assert.match(journeyComponentSource, /message:\s*SCARAB_SEAL_TRIGGER\.firstShardEchoLine/);
  assert.match(journeyComponentSource, /const openMessage = gate\.id === 'temple-approach-seal'/);
  assert.match(journeyComponentSource, /current\.notice = guidance\.openMessage/);
  assert.match(journeyComponentSource, /id:\s*`\$\{activeLevelGate\.id\}-opened`/);
  assert.match(journeyComponentSource, /id:\s*`\$\{.*?\.id\}-opened`/);
  assert.match(journeyComponentSource, /current\.itemPurposeNoticeTimer = Math\.max\(current\.itemPurposeNoticeTimer \|\| 0, 2\.2\)/);
  assert.match(journeyComponentSource, /addRewardPulse\('route-gate-open'/);
  assert.match(journeyComponentSource, /current\.openingSphinxEncounter = null/);
  assert.match(journeyComponentSource, /const OPENING_SPHINX_DURATION = 14;/);
  assert.match(journeyComponentSource, /const OPENING_SPHINX_EXIT_SECONDS = 2\.35;/);
  assert.match(journeyComponentSource, /const OPENING_SPHINX_ARRIVAL_SECONDS = 1\.05;/);
  assert.match(journeyComponentSource, /const OPENING_SPHINX_LINE_SECONDS = 2\.15;/);
  assert.match(journeyComponentSource, /const OPENING_SPHINX_SPRITE_BOSS_ID = 'ancient-construct';/);
  assert.match(journeyComponentSource, /const OPENING_SPHINX_APPARITION_SRC = 'assets\/expedition\/bosses\/anubis-apparition\.png';/);
  assert.match(journeyComponentSource, /const OPENING_SPHINX_SPRITE_VERSION = 'opening-anubis-apparition-2026-05-21';/);
  assert.match(journeyComponentSource, /const OPENING_SPHINX_SCREEN_Y_OFFSET = 112;/);
  assert.match(journeyComponentSource, /drawOpeningSphinxEncounter/);
  assert.match(journeyComponentSource, /projectionReveal/);
  assert.match(journeyComponentSource, /projectionBuild/);
  assert.match(journeyComponentSource, /eyeGlint/);
  assert.match(journeyComponentSource, /cueTimes = \[6\.2,\s*10\.8,\s*14\.8,\s*18\.6,\s*22\.8,\s*26\.5,\s*31\.5\]/);
  assert.match(journeyComponentSource, /fissureCues = \[11\.9,\s*18\.6,\s*26\.5,\s*29\.8\]/);
  assert.ok(existsSync(egyptOpeningTombStairwellPath), 'opening tomb stairwell asset should exist');
  assert.match(journeyComponentSource, /OPENING_TOMB_STAIRWELL_SRC = 'assets\/expedition\/environment\/egypt-opening\/opening-tomb-stairwell\.png'/);
  assert.match(journeyComponentSource, /OPENING_TOMB_STAIRWELL_VERSION = 'opening-tomb-stairwell-generated-2026-05-21'/);
  assert.match(journeyComponentSource, /openingTombStairwellRef/);
  assert.match(journeyComponentSource, /ctx\.drawImage\(tombStairwellAsset\.image/);
  assert.match(journeyComponentSource, /openingTombStairwellAssetLoaded = true/);
  assert.doesNotMatch(journeyComponentSource, /const stoneRows = \[/);
  assert.doesNotMatch(journeyComponentSource, /summitCoverX/);
  assert.match(journeyComponentSource, /openingThresholdAtmosphere/);
  assert.match(journeyComponentSource, /playExpeditionSfx\?\.\('openingThresholdFall'\)/);
  assert.match(journeyComponentSource, /playExpeditionSfx\?\.\('openingThresholdStoneShift'\)/);
  assert.match(journeyComponentSource, /playExpeditionSfx\?\.\('openingThresholdFinalPulse'\)/);
  assert.match(journeyComponentSource, /fallSfxPlayed:\s*false/);
  assert.match(journeyComponentSource, /stoneShiftSfxPlayed:\s*false/);
  assert.match(journeyComponentSource, /finalPulseSfxPlayed:\s*false/);
  assert.match(journeyComponentSource, /fallSfxPlayed:\s*Boolean\(current\.openingThresholdScene\.fallSfxPlayed\)/);
  assert.match(journeyComponentSource, /stoneShiftSfxPlayed:\s*Boolean\(current\.openingThresholdScene\.stoneShiftSfxPlayed\)/);
  assert.match(journeyComponentSource, /finalPulseSfxPlayed:\s*Boolean\(current\.openingThresholdScene\.finalPulseSfxPlayed\)/);
  assert.match(appSource, /openingThresholdAtmosphere:\s*\{/);
  assert.match(appSource, /openingThresholdFall:\s*\{/);
  assert.match(appSource, /openingThresholdStoneShift:\s*\{/);
  assert.match(appSource, /openingThresholdFinalPulse:\s*\{/);
  assert.match(appSource, /opening-desert-wind\.ogg/);
  assert.match(appSource, /id:\s*'wind-bed'[\s\S]*?loop:\s*true/);
  assert.match(appSource, /id:\s*'wind-high-drift'[\s\S]*?playbackRate:\s*1\.08[\s\S]*?loop:\s*true/);
  assert.match(appSource, /id:\s*'wind-low-swell'[\s\S]*?playbackRate:\s*0\.72[\s\S]*?loop:\s*true/);
  assert.match(appSource, /\$\{sfxKey\}:\$\{clip\.id \|\| clip\.path\}/);
  assert.match(appSource, /opening-deep-rumble\.ogg/);
  assert.match(appSource, /opening-earth-shake\.flac/);
  assert.match(source, /dialogueTiming:\s*\[0\.8/);
  assert.match(source, /dialogueSpeakers:[\s\S]*?'Anubis'/);
  assert.match(journeyComponentSource, /const thresholdLines = \[[\s\S]*?ARRIVAL_THRESHOLD_SPAWN_LINE[\s\S]*?The world fell away\.[\s\S]*?I have to find where the seal brought me\./);
  assert.match(journeyComponentSource, /current\.openingSphinxEncounter = null/);
  assert.match(journeyComponentSource, /visibleLineCount/);
  assert.match(journeyComponentSource, /dynamicEnvironmentEvent[\s\S]*?message:\s*SCARAB_SEAL_TRIGGER\.sealEmphasisMessage/);
  assert.match(journeyComponentSource, /current\.hitStopTimer = Math\.max\(current\.hitStopTimer, 0\.12\)/);
  assert.match(journeyComponentSource, /drawOpeningSphinxEncounter/);
  assert.match(journeyComponentSource, /openingSphinxApparitionRef = useRef\(\{ image: null, loaded: false, failed: false \}\)/);
  assert.match(journeyComponentSource, /openingSphinxApparitionRef\.current = \{ image, loaded: true, failed: false \}/);
  assert.match(journeyComponentSource, /ctx\.drawImage\(apparitionAsset\.image,\s*drawBox\.x,\s*drawBox\.y,\s*drawBox\.width,\s*drawBox\.height\)/);
  assert.match(journeyComponentSource, /openingSphinxSpriteModel = 'opening-anubis-apparition'/);
  assert.match(journeyComponentSource, /openingSphinxSpriteFrame = 'openingAnubisApparition'/);
  assert.match(journeyComponentSource, /getBossSpritePack\(bossSpriteAssetsRef\.current,\s*OPENING_SPHINX_SPRITE_BOSS_ID\)/);
  assert.match(journeyComponentSource, /drawAtlasRegion\([\s\S]*?spritePack[\s\S]*?frameKey[\s\S]*?\{\s*mode:\s*'contain',\s*alignY:\s*'bottom'\s*\}/);
  assert.match(journeyComponentSource, /shouldFlipBossSprite\(OPENING_SPHINX_SPRITE_BOSS_ID,\s*-1\)/);
  assert.match(journeyComponentSource, /openingSphinxSpriteFrame/);
  assert.match(journeyComponentSource, /openingSphinxEncounterState:/);
  assert.doesNotMatch(journeyComponentSource, /expedition-journey-notice/);
  assert.match(journeyComponentSource, /spriteAtlasPath:\s*renderStats\.openingSphinxSpriteAtlasPath\s*\|\|\s*ANCIENT_CONSTRUCT_SPRITE_ATLAS_JSON/);
  assert.match(journeyComponentSource, /spriteLoaded:\s*renderStats\.openingSphinxSpriteLoaded[\s\S]*?Boolean\(bossSpriteAssets\.packs\?\.\[OPENING_SPHINX_SPRITE_BOSS_ID\]\?\.loaded\)/);
  assert.match(journeyComponentSource, /OPENING_SPHINX_EXIT_SECONDS/);
  assert.match(journeyComponentSource, /openingSphinxEncounter\.playerX/);
  assert.match(journeyComponentSource, /drawOpeningSphinxDialogue/);
  assert.doesNotMatch(journeyComponentSource, /current\.environmentEvent = \{[\s\S]*?name:\s*SCARAB_SEAL_TRIGGER\.eventName[\s\S]*?message:\s*SCARAB_SEAL_TRIGGER\.messages\.slice\(1\)\.join\(' '\)/);
  assert.match(journeyComponentSource, /b\.id === SCARAB_SEAL_TRIGGER\.bossId[\s\S]*?!current\.scarabSealActivated/);
  assert.match(journeyComponentSource, /scarabSealRequired && current\.openingThresholdScene/);
  assert.match(journeyComponentSource, /target === 'journey-boss-start'/);
  assert.match(journeyComponentSource, /setBriefingOpen\(false\)/);
  assert.match(journeyComponentSource, /current\.scarabSealActivated = true[\s\S]*?Developer mode: \$\{boss\.name\} encounter ready\./);
  assert.match(journeyComponentSource, /current\.seenBossIntroIds\?\.add\(boss\.id\)/);
  assert.match(journeyComponentSource, /SCARAB_SEAL_TRIGGER\.bossIntroLine/);
  assert.match(journeyComponentSource, /SCARAB_SEAL_TRIGGER\.guideFollowUpLine/);
  assert.match(hazards, /id:\s*'opening-seal-reset-trap'[\s\S]*?name:\s*'buried spike trap'[\s\S]*?x:\s*X\(250\)[\s\S]*?width:\s*87[\s\S]*?height:\s*16[\s\S]*?penalty:\s*\{\s*stamina:\s*8\s*\}/);
  assert.doesNotMatch(hazards, /id:\s*'opening-seal-reset-trap'[\s\S]*?pushToStart:\s*true/);
  assert.doesNotMatch(hazards, /id:\s*'opening-seal-reset-trap'[\s\S]*?revealedByScarabSeal:\s*true/);
  assert.match(hazards, /Buried spikes jabbed out of the sand\. Jump cleanly over them\./);
  assert.match(journeyComponentSource, /isHazardAvailable\(hazard, current\)/);
  assert.match(journeyComponentSource, /if \(h\.pushToStart\) \{/);
  assert.match(journeyComponentSource, /player\.x = startCheckpoint\.x/);
  assert.match(journeyRenderAssetsSource, /'opening-seal-reset-trap':\s*'spikeTrap'/);
  assert.doesNotMatch(journeyComponentSource, /visualHazardId === 'opening-seal-reset-trap'[\s\S]*?strokeStyle = 'rgba\(250, 204, 21/);
  assert.doesNotMatch(journeyComponentSource, /openingScarabConfrontationPending/);
  const openingSealRuntimeBlock = journeyComponentSource.slice(
    journeyComponentSource.indexOf("if (backgroundPackId !== 'china-river-valley' && !current.scarabSealActivated)"),
    journeyComponentSource.indexOf('getActiveHiddenRoutes().forEach'),
  );
  assert.doesNotMatch(openingSealRuntimeBlock, /player\.x = playerDomainStartX/);

  assert.match(routeGates, /id:\s*'desert-seal'[\s\S]*?miniBoss:\s*'scarab-queen'[\s\S]*?keyItem:\s*'brush-handle'/);
  assert.match(routeGates, /id:\s*'desert-seal'[\s\S]*?requires:\s*\{\s*objective:\s*'desert-entry',\s*miniBoss:\s*'scarab-queen',\s*keyItem:\s*'brush-handle',\s*shards:\s*10/);
  assert.match(miniBosses, /id:\s*'scarab-queen'[\s\S]*?health:\s*2,\s*damage:\s*7/);
  assert.match(bossKeyItems, /id:\s*'brush-handle'[\s\S]*?bossId:\s*'scarab-queen'[\s\S]*?gateId:\s*'desert-seal'/);
  assert.doesNotMatch(journeyComponentSource, /current\.defeatedMiniBosses\.add\(SCARAB_SEAL_TRIGGER\.bossId\)/);
  assert.doesNotMatch(journeyComponentSource, /current\.collectedBossKeyIds\.add\('brush-handle'\)/);
  assert.match(source, /export const CHINA_MINI_BOSSES = \[/);
});

test('dev smoke helpers expose Scarab Queen payoff and Desert Map Seal readiness without changing route requirements', () => {
  const routeGates = extractExportedArray('ROUTE_GATES');
  const bossKeyItems = extractExportedArray('BOSS_KEY_ITEMS');
  assert.match(devToolsSource, /Smoke: Scarab Queen Payoff/);
  assert.match(devToolsSource, /journey-scarab-payoff/);
  assert.match(devToolsSource, /Smoke: Desert Map Seal Ready/);
  assert.match(devToolsSource, /journey-desert-map-seal-ready/);
  assert.match(expeditionModeSource, /event\.detail\?\.target === 'journey-scarab-payoff'/);
  assert.match(expeditionModeSource, /event\.detail\?\.target === 'journey-desert-map-seal-ready'/);
  assert.match(expeditionModeSource, /postBossReward:\s*journeySnapshot\.postBossReward \|\| null/);
  assert.match(expeditionModeSource, /postBossRewardVisible:\s*Boolean\(journeySnapshot\.postBossRewardVisible \|\| journeySnapshot\.postBossReward\)/);
  assert.match(journeyComponentSource, /target === 'journey-scarab-payoff' \|\| target === 'journey-desert-map-seal-ready'/);
  assert.match(journeyComponentSource, /current\.defeatedMiniBosses\.add\(boss\.id\)/);
  assert.match(journeyComponentSource, /current\.collectedObjectiveIds\.add\('map-tablet'\)/);
  assert.match(journeyComponentSource, /current\.completedObjectiveIds\.add\('desert-entry'\)/);
  assert.match(journeyComponentSource, /current\.collectedBossKeyIds\.add\(keyItem\.id\)/);
  assert.match(journeyComponentSource, /current\.relicShardCount = Math\.max\(current\.relicShardCount, 10\)/);
  assert.match(journeyComponentSource, /buildBossRewardMoment\(current, keyItem, recoverReward \? 'recovered' : 'revealed'\)/);
  assert.match(journeyComponentSource, /id:\s*recoverReward \? 'debug-desert-map-seal-ready' : 'debug-scarab-queen-payoff'/);
  assert.match(journeyComponentSource, /text:\s*recoverReward \? 'SEAL READY' : 'REWARD REVEALED'/);
  assert.match(routeGates, /id:\s*'desert-seal'[\s\S]*?requires:\s*\{\s*objective:\s*'desert-entry',\s*miniBoss:\s*'scarab-queen',\s*keyItem:\s*'brush-handle',\s*shards:\s*10/);
  assert.match(bossKeyItems, /id:\s*'brush-handle'[\s\S]*?routeOpenMessage:\s*'The Scarab Queen falls\. Asha has permission, not trust\. Brush Handle recovered\. The Desert Map Seal answers\.'/);
});

test('opening pyramid uses exactly four invisible platforms aligned to the marked ledges', () => {
  const platforms = extractExportedArray('PLATFORMS');
  const sealTrigger = source.slice(source.indexOf('export const SCARAB_SEAL_TRIGGER = {'), source.indexOf('export const STORY_PROPS = ['));
  const getOpeningPlatform = (label) => {
    const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = platforms.match(new RegExp(`\\{[^}]*x:\\s*(\\d+)[^}]*y:\\s*JY\\((-?\\d+)\\)[^}]*width:\\s*(\\d+)[^}]*label:\\s*'${escapedLabel}'[^}]*invisible:\\s*true`, 'i'));
    assert.ok(match, `${label} should exist`);
    return {
      label,
      x: Number(match[1]),
      y: Number(match[2]),
      width: Number(match[3]),
    };
  };
  const climbLabels = [
    'invisible marked lower pyramid ledge',
    'invisible marked first pyramid terrace',
    'invisible marked second pyramid terrace',
    'invisible marked scarab artefact platform',
  ];
  const route = climbLabels.map(getOpeningPlatform);

  assert.deepEqual(
    route.map(({ x, y, width }) => ({ x, y, width })),
    [
      { x: 0, y: 318, width: 330 },
      { x: 355, y: 171, width: 365 },
      { x: 505, y: 24, width: 355 },
      { x: 770, y: -135, width: 280 },
    ],
  );

  assert.match(sealTrigger, /x:\s*925/);
  assert.match(sealTrigger, /y:\s*JY\(-117\)/);
  assert.match(sealTrigger, /width:\s*160/);
  assert.match(sealTrigger, /height:\s*90/);
  assert.match(journeyComponentSource, /if \(platform\.invisible\)/);
});

test('opening pyramid marked ledges use a scoped double-jump assist instead of extra platforms', () => {
  const platforms = extractExportedArray('PLATFORMS');
  assert.match(journeyComponentSource, /OPENING_PYRAMID_AIR_JUMP_ASSIST_ZONE/);
  assert.match(journeyComponentSource, /OPENING_PYRAMID_GROUND_JUMP_MULTIPLIER\s*=\s*1\.32/);
  assert.match(journeyComponentSource, /OPENING_PYRAMID_AIR_JUMP_MULTIPLIER\s*=\s*1\.6/);
  assert.match(journeyComponentSource, /isOpeningPyramidAirJumpAssistAvailable/);
  assert.match(journeyComponentSource, /openingPyramidGroundJumpMultiplier/);
  assert.match(journeyComponentSource, /current\.openingPyramidAssistJumpAvailable/);
  assert.match(journeyComponentSource, /openingPyramidAssistJump/);
  assert.match(journeyComponentSource, /player\.vy = -JUMP_SPEED \* OPENING_PYRAMID_AIR_JUMP_MULTIPLIER/);
  assert.doesNotMatch(platforms, /pyramid stair/i);
  assert.doesNotMatch(platforms, /helper platform/i);
});

test('opening pyramid facade stays active as the opening gameplay landmark', () => {
  const storyProps = extractExportedArray('STORY_PROPS');
  assert.match(journeyComponentSource, /OPENING_PYRAMID_FACADE_WORLD_LEFT_X\s*=\s*-82/);
  assert.match(storyProps, /id:\s*'opening-pyramid-facade-structure'[\s\S]*?type:\s*'generated-opening-pyramid-facade'[\s\S]*?width:\s*1208[\s\S]*?height:\s*664/);
  assert.match(journeyComponentSource, /GENERATED_STORY_PROP_BOUNDS[\s\S]*?'generated-opening-pyramid-facade':\s*\{\s*width:\s*1208,\s*height:\s*664\s*\}/);
  assert.match(journeyComponentSource, /GENERATED_STORY_PROP_PREVIEW_SOURCES[\s\S]*?'generated-opening-pyramid-facade'[\s\S]*?OPENING_PYRAMID_FACADE_SRC/);
  assert.match(journeyComponentSource, /OPENING_PYRAMID_FACADE_SRC = 'assets\/expedition\/environment\/egypt-opening\/opening-pyramid-facade-no-stairs-v2\.png'/);
  assert.match(journeyComponentSource, /OPENING_PYRAMID_FACADE_VERSION = 'opening-pyramid-facade-no-stairs-v2-2026-06-05'/);
  assert.doesNotMatch(journeyComponentSource, /drawOpeningPyramidFacadeStairConcealment/);
  assert.match(journeyComponentSource, /const openingPyramidFacadeProp = getRenderableStoryProps\(current\)\.find\(prop => prop\.id === 'opening-pyramid-facade-structure'\)/);
  assert.match(journeyComponentSource, /drawOpeningPyramidFacade\(ctx, cameraX, now, openingPyramidFacadeProp\)/);
  assert.match(
    journeyComponentSource,
    /if \(x > CANVAS_WIDTH \+ 80 \|\| x \+ width < -80\) return false;[\s\S]*?ctx\.globalAlpha = Number\.isFinite\(renderProp\.alpha\) \? renderProp\.alpha : 0\.98;/,
  );
  assert.match(journeyComponentSource, /drawOpeningPyramidMasonryBack\(ctx, cameraX, now, current\)/);
  assert.doesNotMatch(journeyComponentSource, /OPENING_PYRAMID_FACADE_MIN_VISIBLE_WIDTH/);
  assert.doesNotMatch(journeyComponentSource, /OPENING_PYRAMID_FACADE_FADE_START_X/);
  assert.doesNotMatch(journeyComponentSource, /OPENING_PYRAMID_FACADE_PLAYER_FADE_START_X/);
  assert.doesNotMatch(journeyComponentSource, /OPENING_PYRAMID_FACADE_HIDE_AFTER_X/);
  assert.doesNotMatch(journeyComponentSource, /OPENING_PYRAMID_FACADE_PLAYER_HIDE_AFTER_X/);
  assert.doesNotMatch(journeyComponentSource, /OPENING_PYRAMID_FACADE_WORLD_RIGHT_X/);
});

test('route props stay out of the opening pyramid facade and use the grounded ruin preset', () => {
  const storyProps = extractExportedArray('STORY_PROPS');

  [
    'desert-entry-premium-threshold-slab-1',
    'desert-entry-premium-column-1',
    'desert-entry-premium-pillar-caps-1',
  ].forEach((id) => {
    const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const row = getDataRowById(storyProps, id);
    assert.match(row, /x:\s*(1[6-9]\d\d|2\d\d\d)/, `${id} should sit past Asha on the open route`);
    assert.match(row, /placementPreset:\s*'desertEntryGroundedRuin'/, `${id} should use the shared grounded placement preset`);
    assert.doesNotMatch(storyProps, new RegExp(`id:\\s*'${escapedId}'[^}]*?depth:\\s*'(background|midground)'`));
  });
  [
    'opening-ruin-climb-fallen-column',
    'opening-ruin-climb-glyph-slab',
    'false-relic-bait-seal-stones',
    'temple-upper-switch-glyph-slab',
    'temple-upper-switch-fallen-column',
    'desert-entry-warning-tablet-1',
    'temple-approach-threshold-tablet-1',
    'broken-ruins-survey-rope',
    'desert-broken-supply-cart',
    'desert-entry-field-chest-1',
    'early-voucher-cache-marker',
    'broken-seal-marker',
    'atmosphere-entry-broken-pillar',
  ].forEach((id) => {
    const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    assert.doesNotMatch(storyProps, new RegExp(`id:\\s*'${escapedId}'`));
  });
  assert.doesNotMatch(storyProps, /sectionId:\s*'desert-entry'[^}]*type:\s*'survey-rope'/);
  assert.match(
    journeyComponentSource,
    /getRenderablePlatforms\(current\)[\s\S]*?\.forEach\(\(platform\) => drawPlatform\(ctx, platform, cameraX, current\)\)[\s\S]*?getZIndexSortedRenderableStoryProps\(current\)\.forEach\(\(prop\) => drawStoryProp\(ctx, prop, cameraX, now, 'route-edge'\)\)/,
  );
  assert.match(journeyComponentSource, /if \(\['background', 'midground', 'grounded', 'route-edge', 'foreground-occluder'\]\.includes\(prop\.depth\)\) return prop\.depth;/);
  assert.match(journeyComponentSource, /if \(placementPreset\?\.depth\) return placementPreset\.depth;/);
});

test('story prop depth changes preserve the original asset colour grade', () => {
  const drawStoryPropSource = getComponentFunctionSource('drawStoryProp');

  assert.match(drawStoryPropSource, /const propColorFilter = \(\(\) => \{/);
  assert.match(drawStoryPropSource, /if \(propSize\.tint === 'stone'\) return 'sepia\(8%\) saturate\(78%\) brightness\(90%\)'/);
  assert.match(drawStoryPropSource, /if \(propColorFilter && propColorFilter !== 'none'\) ctx\.filter = propColorFilter;/);
  assert.doesNotMatch(drawStoryPropSource, /ctx\.filter = propSize\.depth === 'background'/);
  assert.doesNotMatch(drawStoryPropSource, /ctx\.filter = 'sepia\(8%\) saturate\(118%\) brightness\(96%\) contrast\(118%\)'/);
  assert.match(drawStoryPropSource, /else if \(propSize\.depth === 'route-edge'\)[\s\S]*?ctx\.shadowColor = 'rgba\(35, 21, 10, 0\.62\)'/);
});

test('opening pyramid zone only contains the intentional first-screen stairway platforms', () => {
  const platforms = extractExportedArray('PLATFORMS');
  const allowedOpeningLabels = new Set([
    'desert track before the ravine',
    'invisible marked lower pyramid ledge',
    'invisible marked first pyramid terrace',
    'invisible marked second pyramid terrace',
    'invisible marked scarab artefact platform',
    'facade-marked broken ruin lower climb',
    'facade-marked broken ruin middle climb',
    'facade-marked Map Tablet ledge',
  ]);
  const platformLines = platforms
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('{') && line.includes('label:'));
  const horizontalScale = Number(journeyConstantsSource.match(/JOURNEY_HORIZONTAL_SCALE\s*=\s*([\d.]+)/)?.[1] || NaN);
  assert.ok(Number.isFinite(horizontalScale), 'Journey horizontal scale should be parseable');
  const openingZonePlatforms = platformLines
    .map((line) => {
      const rawXMatch = line.match(/x:\s*(\d+)/);
      const scaledXMatch = line.match(/x:\s*X\((\d+)\)/);
      const labelMatch = line.match(/label:\s*'([^']+)'/);
      const rawX = rawXMatch ? Number(rawXMatch[1]) : null;
      const scaledX = scaledXMatch ? Number(scaledXMatch[1]) * horizontalScale : null;
      return {
        label: labelMatch?.[1] || 'unknown platform',
        x: rawX ?? scaledX ?? Number.POSITIVE_INFINITY,
      };
    })
    .filter((platform) => platform.x <= 1200);

  const unexpectedLabels = openingZonePlatforms
    .filter((platform) => !allowedOpeningLabels.has(platform.label))
    .map((platform) => platform.label);

  assert.deepEqual(unexpectedLabels, []);
  assert.equal(openingZonePlatforms.filter((platform) => platform.label !== 'desert track before the ravine').length, 4);
});

test('obsolete Desert Entry challenge platforms do not crowd the opening pyramid', () => {
  const platforms = extractExportedArray('PLATFORMS');
  [
    'sealed scarab pyramid base',
    'visible lower pyramid step block',
    'visible second pyramid step block',
    'visible third pyramid step block',
    'visible upper pyramid step block',
    'middle recovery temple slab',
    'visible upper temple step block',
    'visible summit approach step block',
    'visible summit stair block',
    'visible capstone stair block',
    'visible seal pedestal step block',
    'scarab seal summit platform',
    'desert checkpoint launch',
    'desert high shard cracked step',
    'desert high shard landing',
    'desert high shard unstable ledge',
    'lower route rejoin',
    'upper shard path',
    'warning slab path',
    'survey ridge',
    'guardian lookout perch',
    'scarab seal climb capstone',
    'guardian warning step',
    'seal approach ledge',
    'broken ruins route entry',
    'half-buried lintel',
    'ruins recovery step',
  ].forEach((label) => {
    assert.doesNotMatch(platforms, new RegExp(label));
  });
  assert.doesNotMatch(platforms, /desert-high-shard-climb/);
});

test('Egypt opening ambient life no longer draws deprecated sketch scenery', () => {
  assert.match(journeyComponentSource, /drawEgyptAmbientLife/);
  assert.doesNotMatch(journeyComponentSource, /drawDistantExpeditionWorker/);
  assert.doesNotMatch(journeyComponentSource, /drawKneelingSurveyor/);
  assert.doesNotMatch(journeyComponentSource, /drawTentFlap/);
  assert.doesNotMatch(journeyComponentSource, /drawRopedDigActivity/);
  assert.doesNotMatch(journeyComponentSource, /desert-survey-camp-life/);
});

test('player polish extends the canonical Journey animation and weapon paths', () => {
  [
    'survey-walk',
    'walk',
    'run',
    'jump',
    'fall',
    'land',
    'attack',
    'hurt',
  ].forEach((state) => {
    assert.match(journeyUtilsSource, new RegExp(`'${state}'`));
  });
  assert.match(journeyUtilsSource, /getPlayerMovementVisualStyle/);
  assert.match(journeyUtilsSource, /visualWalkStyle/);
  assert.match(journeyConstantsSource, /ATTACK_DURATION = 0\.42/);
  assert.match(journeyConstantsSource, /ATTACK_WINDUP_DURATION = 0\.12/);
  assert.match(journeyConstantsSource, /ATTACK_RECOIL_DURATION = 0\.18/);
  assert.match(journeyComponentSource, /drawPlayerSprite/);
  assert.match(journeyComponentSource, /drawPlayerKhopesh/);
  assert.match(journeyComponentSource, /weapon-hit-spark/);
  assert.match(journeyComponentSource, /playerAttackBox/);
  assert.match(journeyGameplayContractSource, /PLAYER_ATTACK_RANGE = 92/);
  assert.match(journeyGameplayContractSource, /PLAYER_ATTACK_HEIGHT = 36/);
  assert.match(journeyGameplayContractSource, /PLAYER_ATTACK_BACK_REACH = 10/);
  assert.doesNotMatch(journeyUtilsSource, /PLAYER_WIDTH\s*=/);
  assert.doesNotMatch(journeyUtilsSource, /PLAYER_HEIGHT\s*=/);
});

test('China Journey uses a unique female player atlas through the existing player renderer', () => {
  assert.match(journeyConstantsSource, /PLAYER_CHINA_HERO_SPRITE_ATLAS_JSON/);
  assert.match(journeyConstantsSource, /china-female-archaeologist-production-spritesheet\.json/);
  assert.match(journeyComponentSource, /china-female-archaeologist/);
  assert.match(journeyComponentSource, /backgroundPackId === 'china-river-valley'/);
  assert.match(journeyComponentSource, /playerHeroSpriteConfig/);
  assert.match(journeyComponentSource, /fallbackSrc/);
  assert.match(journeyComponentSource, /suppressExternalWeaponDuringAttack/);
  assert.match(journeyComponentSource, /suppressRuntimeAttackArc/);
  assert.match(journeyComponentSource, /groundLineY/);
});

test('Egypt Journey uses the Asha atlas through the existing player renderer', () => {
  assert.match(journeyConstantsSource, /PLAYER_HERO_SPRITE_ATLAS_JSON/);
  assert.match(journeyConstantsSource, /asha-reference-warrior-dodge-preview-spritesheet\.json/);
  assert.doesNotMatch(journeyConstantsSource, /asha-v4-spritesheet\.json/);
  assert.match(journeyConstantsSource, /PLAYER_HERO_SPRITE_VERSION = 'asha-reference-warrior-dodge-backstep-tone-matched-2026-06-05'/);
  assert.equal(ashaReferenceWarriorDodgePreviewAtlas.masterReference, 'asha-reference-warrior-master-reference.png');
  assert.equal(ashaReferenceWarriorDodgePreviewAtlas.status, 'approved-asha-reference-warrior-dodge-backstep-tone-matched');
  assert.equal(ashaReferenceWarriorDodgePreviewAtlas.draw.rowScaleMultipliers.run, 0.965);
  assert.equal(ashaReferenceWarriorDodgePreviewAtlas.draw.rowScaleMultipliers.attack_pick_swing_sweep, 1.16);
  assert.equal(ashaReferenceWarriorDodgePreviewAtlas.draw.frameScaleMultipliers.attack_pick_swing_alt_03, 1.3);
  assert.match(journeyComponentSource, /characterId:\s*'asha-reference-warrior'/);
  assert.match(journeyComponentSource, /asha-final-production-spritesheet\.json/);
  assert.match(journeyConstantsSource, /PLAYER_HERO_PREVIOUS_SPRITE_ATLAS_JSON/);
  assert.match(journeyConstantsSource, /asha-hooded-warrior-explorer-spritesheet\.json/);
  assert.match(journeyConstantsSource, /PLAYER_HERO_FALLBACK_SPRITE_ATLAS_JSON/);
  assert.match(journeyConstantsSource, /egypt-warrior-guide-spritesheet\.json/);
  assert.match(journeyComponentSource, /characterId:\s*'asha-reference-warrior'/);
  assert.match(journeyComponentSource, /atlasPath:\s*PLAYER_HERO_SPRITE_ATLAS_JSON/);
  assert.match(journeyComponentSource, /version:\s*PLAYER_HERO_SPRITE_VERSION/);
  assert.match(journeyComponentSource, /fallbackAtlasPath:\s*'assets\/expedition\/player\/asha-final-production-spritesheet\.json'/);
  assert.match(journeyComponentSource, /fallbackCharacterId:\s*'asha-final-production'/);
  assert.match(journeyComponentSource, /characterId:\s*'asha-final-production'/);
  assert.match(journeyComponentSource, /label:\s*'Asha Final Production'/);
  assert.match(journeyComponentSource, /label:\s*'Asha Hooded Previous'/);
  assert.match(journeyComponentSource, /atlasPath:\s*'assets\/expedition\/player\/asha-final-production-spritesheet\.json'/);
  assert.match(journeyComponentSource, /version:\s*'asha-master-reference-motion-2026-05-23'/);
  assert.match(journeyComponentSource, /fallbackAtlasPath:\s*PLAYER_HERO_PREVIOUS_SPRITE_ATLAS_JSON/);
  assert.match(journeyComponentSource, /fallbackCharacterId:\s*'asha-egypt-warrior-explorer'/);
  assert.match(journeyComponentSource, /fallbackSrc:\s*PLAYER_LEGACY_SPRITE_SRC/);
  assert.match(journeyComponentSource, /if\s*\(!atlasPath\)\s*\{\s*loadLegacySprite\(\);/);
  assert.equal(egyptPlayerAtlas.draw.suppressExternalWeapon, true);
  assert.equal(egyptPlayerAtlas.draw.suppressRuntimeAttackArc, true);
  assert.equal(egyptPlayerAtlas.status, 'production-candidate-final-asha-master-reference-motion');
  assert.equal(egyptPlayerAtlas.productionReference, 'asha-final-production-reference.png');
  assert.equal(egyptPlayerAtlas.draw.height, 108);
  assert.ok(egyptPlayerAtlas.draw.height >= 80 && egyptPlayerAtlas.draw.height <= 110);
  assert.equal(egyptPlayerAtlas.draw.sourceHeight, 224);
  assert.equal(egyptPlayerAtlas.frame.width, 256);
  assert.equal(egyptPlayerAtlas.frame.height, 256);
  assert.equal(
    egyptPlayerAtlas.source,
    'imagegen-master-reference-asha-idle-jump-damage-run-2026-05-23',
  );
  assert.equal(egyptPreviousPlayerAtlas.status, 'active-egypt-hooded-warrior-explorer-atlas-production-ready');
  assert.equal(egyptPlayerAtlas.rows.find(row => row.name === 'idle')?.frameCount, 8);
  assert.equal(egyptPlayerAtlas.rows.find(row => row.name === 'walk')?.frameCount, 8);
  assert.equal(egyptPlayerAtlas.rows.find(row => row.name === 'run')?.frameCount, 10);
  assert.equal(egyptPlayerAtlas.rows.find(row => row.name === 'survey_walk')?.frameCount, 8);
  assert.deepEqual(
    egyptPlayerAtlas.rows.find(row => row.name === 'idle')?.frames,
    Array.from({ length: 8 }, (_, index) => `idle_${String(index).padStart(2, '0')}`),
  );
  assert.deepEqual(
    egyptPlayerAtlas.rows.find(row => row.name === 'walk')?.frames,
    Array.from({ length: 8 }, (_, index) => `walk_${String(index).padStart(2, '0')}`),
  );
  assert.deepEqual(
    egyptPlayerAtlas.rows.find(row => row.name === 'run')?.frames,
    Array.from({ length: 10 }, (_, index) => `run_${String(index).padStart(2, '0')}`),
  );
  assert.deepEqual(
    egyptPlayerAtlas.rows.find(row => row.name === 'survey_walk')?.frames,
    Array.from({ length: 8 }, (_, index) => `survey_walk_${String(index).padStart(2, '0')}`),
  );
  assert.deepEqual(
    egyptPlayerAtlas.rows.find(row => row.name === 'jump')?.frames,
    Array.from({ length: 8 }, (_, index) => `jump_${String(index).padStart(2, '0')}`),
  );
  assert.deepEqual(
    egyptPlayerAtlas.rows.find(row => row.name === 'fall')?.frames,
    Array.from({ length: 8 }, (_, index) => `fall_${String(index).padStart(2, '0')}`),
  );
  assert.deepEqual(
    egyptPlayerAtlas.rows.find(row => row.name === 'land')?.frames,
    Array.from({ length: 8 }, (_, index) => `land_${String(index).padStart(2, '0')}`),
  );
  assert.equal(egyptPlayerAtlas.rows.find(row => row.name === 'hurt')?.frameCount, 5);
  assert.deepEqual(
    egyptPlayerAtlas.rows.find(row => row.name === 'hurt')?.frames,
    Array.from({ length: 5 }, (_, index) => `hurt_${String(index).padStart(2, '0')}`),
  );
  assert.equal(egyptPlayerAtlas.poseSources.idle_00, 'asha-master-reference-idle-8frame-alpha.png:frame_00');
  assert.equal(egyptPlayerAtlas.poseSources.idle_07, 'asha-master-reference-idle-8frame-alpha.png:frame_07');
  assert.equal(egyptPlayerAtlas.poseSources.run_00, 'asha-master-reference-run-10frame-alpha.png:frame_00');
  assert.equal(egyptPlayerAtlas.poseSources.run_03, 'asha-master-reference-run-10frame-alpha.png:frame_03');
  assert.equal(egyptPlayerAtlas.poseSources.run_09, 'asha-master-reference-run-10frame-alpha.png:frame_09');
  assert.equal(egyptPlayerAtlas.poseSources.walk_03, 'asha-master-reference-run-10frame-alpha.png:frame_03');
  assert.equal(egyptPlayerAtlas.poseSources.attack_pick_swing_00, 'asha-final-polished-sword-attack-source.png:frame_00');
  assert.equal(egyptPlayerAtlas.poseSources.attack_pick_swing_03, 'asha-final-polished-sword-attack-source.png:frame_03');
  assert.equal(egyptPlayerAtlas.poseSources.attack_pick_swing_07, 'asha-final-polished-sword-attack-source.png:frame_07');
  assert.equal(egyptPlayerAtlas.poseSources.jump_04, 'asha-master-reference-jump-8frame-alpha.png:frame_03');
  assert.equal(egyptPlayerAtlas.poseSources.fall_04, 'asha-master-reference-jump-8frame-alpha.png:frame_05');
  assert.equal(egyptPlayerAtlas.poseSources.land_02, 'asha-master-reference-jump-8frame-alpha.png:frame_07');
  assert.equal(egyptPlayerAtlas.poseSources.hurt_04, 'asha-master-reference-damage-5frame-alpha.png:frame_04');
  assert.equal(egyptPlayerAtlas.rows.length, 12);
  assert.equal(Object.keys(egyptPlayerAtlas.regions).length, 95);
  assert.equal(Object.keys(egyptPlayerAtlas.poseSources).length, 95);
  assert.ok(egyptPlayerFallbackAtlas.regions.idle_00);
  assert.ok(egyptPlayerAtlas.regions.run_00.drawBounds);
  assert.match(journeyComponentSource, /heroRegion\?\.drawBounds/);
  assert.match(journeyComponentSource, /nominalFrameHeight/);
  assert.match(journeyComponentSource, /boundedGroundLineY/);
  assert.match(journeyUtilsSource, /if \(animationState === 'jump'\) \{/);
  assert.match(journeyUtilsSource, /if \(animationState === 'fall'\) \{/);
  assert.match(journeyUtilsSource, /if \(animationState === 'land'\) \{/);
  assert.match(journeyUtilsSource, /player\.landingFeedbackTimer/);
  assert.match(journeyComponentSource, /heroAtlas\?\.draw\?\.suppressExternalWeapon/);
  assert.match(journeyComponentSource, /rowName === 'idle'\s*\?\s*Math\.floor\(now \/ 150\) % frameCount/);
  assert.match(journeyComponentSource, /firstSwingFrame/);
  assert.match(journeyComponentSource, /lastSwingFrame/);
});

test('Asha V6 high-resolution atlas template is inactive and uses the existing renderer contract', () => {
  assert.equal(ashaV6HiresPlayerAtlas.status, 'inactive-template-no-runtime-png');
  assert.equal(ashaV6HiresPlayerAtlas.image, 'asha-v6-hires-spritesheet.png');
  assert.equal(ashaV6HiresPlayerAtlas.frame.width, 512);
  assert.equal(ashaV6HiresPlayerAtlas.frame.height, 512);
  assert.equal(ashaV6HiresPlayerAtlas.frame.groundLineY, 472);
  assert.equal(ashaV6HiresPlayerAtlas.frame.facing, 'right');
  assert.equal(ashaV6HiresPlayerAtlas.draw.height, 132);
  assert.equal(ashaV6HiresPlayerAtlas.draw.sourceHeight, 448);
  assert.equal(ashaV6HiresPlayerAtlas.layout.columns, 8);
  assert.equal(ashaV6HiresPlayerAtlas.layout.rows, 12);
  assert.equal(ashaV6HiresPlayerAtlas.layout.pngWidth, 4096);
  assert.equal(ashaV6HiresPlayerAtlas.layout.pngHeight, 6144);
  assert.deepEqual(
    ashaV6HiresPlayerAtlas.rows.map(row => row.name),
    ['idle', 'walk', 'run', 'survey_walk', 'jump', 'fall', 'land', 'attack_pick_swing', 'hurt', 'interact', 'climb', 'push_pull'],
  );
  assert.equal(Object.keys(ashaV6HiresPlayerAtlas.regions).length, 96);
  assert.equal(ashaV6HiresPlayerAtlas.regions.attack_pick_swing_07.x, 7 * 512);
  assert.equal(ashaV6HiresPlayerAtlas.regions.attack_pick_swing_07.y, 7 * 512);
  assert.match(journeyComponentSource, /heroAtlas\?\.draw\?\.height/);
  assert.match(journeyComponentSource, /heroAtlas\?\.draw\?\.sourceHeight/);
  assert.match(journeyComponentSource, /heroAtlas\?\.frame\?\.height/);
  assert.match(journeyComponentSource, /heroRegion\?\.drawBounds/);
  assert.match(journeyComponentSource, /heroRegion\?\.groundLineY/);
  assert.doesNotMatch(journeyConstantsSource, /asha-v6-hires-spritesheet\.json/);
  assert.doesNotMatch(journeyComponentSource, /atlasPath:\s*'assets\/expedition\/player\/asha-v6-hires-spritesheet\.json'/);
});

test('Asha Reference Warrior remains available as a separate character-loader atlas', () => {
  assert.match(journeyComponentSource, /id:\s*'asha-reference-warrior'/);
  assert.match(journeyComponentSource, /label:\s*'Asha Reference Warrior'/);
  assert.match(journeyComponentSource, /atlasPath:\s*PLAYER_HERO_SPRITE_ATLAS_JSON/);
  assert.match(journeyComponentSource, /assets\/expedition\/player\/asha-reference-warrior-reference\.png/);
  assert.equal(ashaReferenceWarriorPlayerAtlas.status, 'approved-asha-reference-warrior-dodge-backstep-tone-matched');
  assert.equal(ashaReferenceWarriorPlayerAtlas.productionReference, 'asha-reference-warrior-reference.png');
  assert.equal(ashaReferenceWarriorPlayerAtlas.draw.height, 130);
  assert.equal(ashaReferenceWarriorPlayerAtlas.frame.width, 390);
  assert.equal(ashaReferenceWarriorPlayerAtlas.frame.height, 256);
  assert.equal(ashaReferenceWarriorPlayerAtlas.draw.suppressExternalWeapon, true);
  assert.equal(ashaReferenceWarriorPlayerAtlas.draw.suppressRuntimeAttackArc, true);
  assert.match(
    ashaReferenceWarriorPlayerAtlas.description,
    /upgraded three-hit attack chain/,
  );
  assert.deepEqual(ashaReferenceWarriorPlayerAtlas.draw.attackChainRows, [
    'attack_pick_swing',
    'attack_pick_swing_alt',
    'attack_pick_swing_sweep',
  ]);
  assert.equal(ashaReferenceWarriorPlayerAtlas.draw.rowScaleMultipliers.walk, 0.965);
  assert.equal(ashaReferenceWarriorPlayerAtlas.draw.rowScaleMultipliers.run, 0.965);
  assert.equal(ashaReferenceWarriorPlayerAtlas.draw.rowScaleMultipliers.survey_walk, 0.965);
  assert.equal(ashaReferenceWarriorPlayerAtlas.draw.rowScaleMultipliers.attack_pick_swing_sweep, 1.16);
  assert.equal(ashaReferenceWarriorPlayerAtlas.draw.frameScaleMultipliers.attack_pick_swing_alt_03, 1.3);
  assert.match(journeyComponentSource, /attackChainRows/);
  assert.match(journeyComponentSource, /rowScaleMultipliers/);
  assert.match(journeyComponentSource, /frameScaleMultipliers/);
  assert.match(journeyComponentSource, /playerSpriteRowScale/);
  assert.match(journeyComponentSource, /playerSpriteFrameScale/);
  assert.equal(ashaReferenceWarriorPlayerAtlas.rows.length, 15);
  assert.equal(ashaReferenceWarriorPlayerAtlas.rows.find(row => row.name === 'idle')?.frameCount, 8);
  assert.equal(ashaReferenceWarriorPlayerAtlas.rows.find(row => row.name === 'run')?.frameCount, 8);
  assert.equal(ashaReferenceWarriorPlayerAtlas.rows.find(row => row.name === 'jump')?.frameCount, 8);
  assert.equal(ashaReferenceWarriorPlayerAtlas.rows.find(row => row.name === 'attack_pick_swing')?.frameCount, 8);
  assert.equal(ashaReferenceWarriorPlayerAtlas.rows.find(row => row.name === 'dodge')?.frameCount, 8);
  assert.equal(ashaReferenceWarriorPlayerAtlas.rows.find(row => row.name === 'attack_pick_swing_alt')?.frameCount, 8);
  assert.equal(ashaReferenceWarriorPlayerAtlas.rows.find(row => row.name === 'attack_pick_swing_sweep')?.frameCount, 8);
  assert.equal(ashaReferenceWarriorPlayerAtlas.rows.find(row => row.name === 'hurt')?.frameCount, 5);
  assert.equal(ashaReferenceWarriorPlayerAtlas.rows.find(row => row.name === 'interact')?.frameCount, 6);
  assert.equal(ashaReferenceWarriorPlayerAtlas.rows.find(row => row.name === 'climb')?.frameCount, 8);
  assert.equal(ashaReferenceWarriorPlayerAtlas.rows.find(row => row.name === 'push_pull')?.frameCount, 8);
  assert.equal(Object.keys(ashaReferenceWarriorPlayerAtlas.regions).length, 115);
  assert.equal(Object.keys(ashaReferenceWarriorPlayerAtlas.poseSources).length, 115);
  assert.equal(
    ashaReferenceWarriorPlayerAtlas.poseSources.idle_00,
    'asha-reference-warrior-idle-still-guard-pass1-normalized-4096x512-candidate-2026-05-30.png:frame_00',
  );
  assert.equal(
    ashaReferenceWarriorPlayerAtlas.poseSources.attack_pick_swing_07,
    'asha-reference-warrior-attack-chain-01-entry-horizontal-framebyframe-approved-4096x512-2026-06-03.png:frame_07',
  );
  assert.equal(
    ashaReferenceWarriorPlayerAtlas.poseSources.attack_pick_swing_alt_07,
    'asha-reference-warrior-attack-chain-02-rising-diagonal-framebyframe-approved-4096x512-2026-06-03.png:frame_07',
  );
  assert.equal(
    ashaReferenceWarriorPlayerAtlas.poseSources.attack_pick_swing_sweep_07,
    'asha-reference-warrior-attack-chain-03-heavy-sweep-framebyframe-approved-4096x512-2026-06-03.png:frame_07',
  );
  assert.equal(
    ashaReferenceWarriorPlayerAtlas.poseSources.hurt_04,
    'asha-reference-warrior-hurt-framebyframe-pass1-normalized-2560x512-candidate-2026-05-30.png:frame_04',
  );
  assert.equal(
    ashaReferenceWarriorPlayerAtlas.poseSources.run_07,
    'asha-reference-warrior-run-framebyframe-pass1-normalized-4096x512-candidate-2026-05-30.png:frame_07',
  );
  assert.equal(
    ashaReferenceWarriorPlayerAtlas.poseSources.jump_07,
    'asha-reference-warrior-jump-framebyframe-pass1-normalized-4096x512-candidate-2026-05-30.png:frame_07',
  );
  assert.ok(ashaReferenceWarriorPlayerAtlas.regions.idle_00.drawBounds.h >= 210);
  assert.ok(ashaReferenceWarriorPlayerAtlas.regions.idle_00.drawBounds.w >= 60);
  assert.ok(Math.max(
    ashaReferenceWarriorPlayerAtlas.regions.attack_pick_swing_03.drawBounds.w,
    ashaReferenceWarriorPlayerAtlas.regions.attack_pick_swing_04.drawBounds.w,
    ashaReferenceWarriorPlayerAtlas.regions.attack_pick_swing_alt_03.drawBounds.w,
    ashaReferenceWarriorPlayerAtlas.regions.attack_pick_swing_sweep_03.drawBounds.w,
  ) >= 170);
  assert.equal(
    ashaReferenceWarriorPlayerAtlas.source,
    'asha-reference-warrior-dodge-backstep-tone-matched-2026-06-05',
  );
  assert.match(journeyGameplayContractSource, /PLAYER_ATTACK_FINISHER_ROW\s*=\s*'attack_pick_swing_sweep'/);
  assert.match(journeyComponentSource, /getPlayerAttackTiming\(nextAttackSequenceIndex\)/);
  assert.match(journeyComponentSource, /current\.attackSwingDuration\s*=\s*attackTiming\.swing/);
});

test('Asha V5 is available as a separate character-loader atlas', () => {
  assert.match(journeyComponentSource, /id:\s*'asha-v5-candidate'/);
  assert.match(journeyComponentSource, /label:\s*'Asha V5'/);
  assert.match(journeyComponentSource, /characterId:\s*'asha-v5-candidate'/);
  assert.match(journeyComponentSource, /atlasPath:\s*'assets\/expedition\/player\/asha-v5-spritesheet\.json'/);
  assert.equal(ashaV5PlayerAtlas.status, 'production-candidate-asha-v5-alternative');
  assert.equal(ashaV5PlayerAtlas.productionReference, 'asha-v5-reference.png');
  assert.equal(ashaV5PlayerAtlas.draw.height, 119);
  assert.equal(ashaV5PlayerAtlas.draw.frameDistance.run, 26);
  assert.equal(ashaV5PlayerAtlas.draw.frameDistance.walk, 22);
  assert.equal(ashaV5PlayerAtlas.draw.frameDistance.survey_walk, 34);
  assert.equal(ashaV5PlayerAtlas.draw.fixedFrame.idle, 'idle_00');
  assert.ok(ashaV5PlayerAtlas.description.includes('10 percent larger'));
  assert.ok(ashaV5PlayerAtlas.description.includes('brightness, contrast'));
  assert.match(journeyComponentSource, /getHeroSpriteFrameDistance\(atlas, rowName\)/);
  assert.match(journeyComponentSource, /getHeroSpriteFixedFrame\(atlas, rowName, row\)/);
  assert.equal(ashaV5PlayerAtlas.draw.suppressExternalWeapon, true);
  assert.equal(ashaV5PlayerAtlas.draw.suppressRuntimeAttackArc, true);
  assert.equal(ashaV5PlayerAtlas.rows.find(row => row.name === 'idle')?.frameCount, 8);
  assert.equal(ashaV5PlayerAtlas.rows.find(row => row.name === 'run')?.frameCount, 10);
  assert.equal(ashaV5PlayerAtlas.rows.find(row => row.name === 'jump')?.frameCount, 8);
  assert.equal(ashaV5PlayerAtlas.rows.find(row => row.name === 'hurt')?.frameCount, 5);
  assert.equal(ashaV5PlayerAtlas.rows.find(row => row.name === 'interact')?.frameCount, 6);
  assert.equal(ashaV5PlayerAtlas.rows.find(row => row.name === 'climb')?.frameCount, 8);
  assert.equal(Object.keys(ashaV5PlayerAtlas.regions).length, 93);
  assert.equal(ashaV5PlayerAtlas.poseSources.run_09, 'asha-v5-run-source.png:frame_09');
  assert.equal(ashaV5PlayerAtlas.poseSources.hurt_04, 'asha-v5-damage-source.png:frame_04');
});

test('Asha New Idle is available as a separate character-loader atlas', () => {
  assert.match(journeyComponentSource, /id:\s*'asha-new-idle'/);
  assert.match(journeyComponentSource, /label:\s*'Asha New Idle'/);
  assert.match(journeyComponentSource, /characterId:\s*'asha-new-idle'/);
  assert.match(journeyComponentSource, /atlasPath:\s*'assets\/expedition\/player\/asha-new-idle-spritesheet\.json'/);
  assert.match(journeyComponentSource, /fallbackAtlasPath:\s*'assets\/expedition\/player\/asha-v5-spritesheet\.json'/);
  assert.match(journeyComponentSource, /attackSequenceIndex/);
  assert.match(journeyComponentSource, /attack_pick_swing_alt/);
  assert.equal(ashaNewIdlePlayerAtlas.status, 'production-candidate-asha-premium-identity');
  assert.equal(ashaNewIdlePlayerAtlas.productionReference, 'asha-new-idle-reference.png');
  assert.equal(ashaNewIdlePlayerAtlas.draw.height, 131);
  assert.equal(ashaNewIdlePlayerAtlas.draw.fixedFrame.idle, undefined);
  assert.equal(ashaNewIdlePlayerAtlas.rows.find(row => row.name === 'idle')?.frameCount, 8);
  assert.equal(ashaNewIdlePlayerAtlas.rows.find(row => row.name === 'attack_pick_swing_alt')?.frameCount, 8);
  assert.deepEqual(ashaNewIdlePlayerAtlas.draw.alternateAttackRows, ['attack_pick_swing', 'attack_pick_swing_alt']);
  assert.equal(Object.keys(ashaNewIdlePlayerAtlas.regions).length, 101);
  assert.equal(
    ashaNewIdlePlayerAtlas.poseSources.idle_00,
    'asha-premium-idle-regeneration-02-reference-locked-raw.png:frame_00',
  );
  assert.equal(
    ashaNewIdlePlayerAtlas.poseSources.idle_07,
    'asha-premium-idle-regeneration-02-reference-locked-raw.png:frame_07',
  );
  assert.equal(
    ashaNewIdlePlayerAtlas.poseSources.walk_00,
    'asha-premium-run-regeneration-04-reference-locked-raw.png:frame_00',
  );
  assert.equal(
    ashaNewIdlePlayerAtlas.poseSources.run_09,
    'asha-premium-run-regeneration-04-reference-locked-raw.png:frame_05',
  );
  assert.equal(
    ashaNewIdlePlayerAtlas.poseSources.survey_walk_00,
    'asha-premium-run-regeneration-04-reference-locked-raw.png:frame_00',
  );
  assert.equal(
    ashaNewIdlePlayerAtlas.poseSources.jump_00,
    'asha-premium-jump-regeneration-03-reference-locked-raw.png:frame_00',
  );
  assert.equal(
    ashaNewIdlePlayerAtlas.poseSources.jump_07,
    'asha-premium-jump-regeneration-03-reference-locked-raw.png:frame_07',
  );
  assert.equal(
    ashaNewIdlePlayerAtlas.poseSources.fall_00,
    'asha-premium-jump-regeneration-03-reference-locked-raw.png:frame_03',
  );
  assert.equal(
    ashaNewIdlePlayerAtlas.poseSources.land_02,
    'asha-premium-jump-regeneration-03-reference-locked-raw.png:frame_07',
  );
  assert.equal(
    ashaNewIdlePlayerAtlas.poseSources.attack_pick_swing_00,
    'asha-premium-attack-regeneration-03-reference-locked-raw.png:frame_00',
  );
  assert.equal(
    ashaNewIdlePlayerAtlas.poseSources.attack_pick_swing_05,
    'asha-premium-attack-regeneration-03-reference-locked-raw.png:frame_05',
  );
  assert.equal(
    ashaNewIdlePlayerAtlas.poseSources.attack_pick_swing_alt_00,
    'asha-premium-attack-alt-regeneration-04-reference-locked-raw.png:frame_00',
  );
  assert.equal(
    ashaNewIdlePlayerAtlas.poseSources.attack_pick_swing_alt_07,
    'asha-premium-attack-alt-regeneration-04-reference-locked-raw.png:frame_07',
  );
  assert.equal(
    ashaNewIdlePlayerAtlas.poseSources.hurt_04,
    'asha-premium-hurt-regeneration-02-reference-locked-raw.png:frame_04',
  );
  assert.equal(ashaNewIdlePlayerAtlas.regions.run_00.drawBounds.h, 193);
  assert.equal(ashaNewIdlePlayerAtlas.regions.jump_01.drawBounds.h, 197);
  assert.equal(ashaNewIdlePlayerAtlas.regions.attack_pick_swing_00.drawBounds.h, 193);
  assert.equal(ashaNewIdlePlayerAtlas.regions.hurt_00.drawBounds.h, 220);
  assert.ok(ashaNewIdlePlayerAtlas.description.includes('secondary attack row'));
});

test('Asha V2 candidate exposes its full idle animation and cache-busts player atlas loads', () => {
  assert.match(journeyComponentSource, /id:\s*'asha-v2-candidate'/);
  assert.match(journeyComponentSource, /label:\s*'Asha V2 Candidate'/);
  assert.match(journeyComponentSource, /characterId:\s*'asha-v2-production-candidate'/);
  assert.match(journeyComponentSource, /atlasPath:\s*'assets\/expedition\/player\/asha-v2-production-candidate-spritesheet\.json'/);
  assert.match(journeyComponentSource, /version:\s*'asha-v2-production-candidate-idle-8frame-2026-05-28'/);
  assert.match(journeyComponentSource, /fetch\(`\$\{baseUrl\}\$\{heroAtlasPath\}\$\{versionQuery\}`\)/);
  assert.match(journeyComponentSource, /image\.src\s*=\s*`\$\{baseUrl\}\$\{getAtlasImagePath\(heroAtlasPath,\s*atlas\.image\)\}\$\{versionQuery\}`/);
  assert.equal(ashaV2PlayerAtlas.rows.find(row => row.name === 'idle')?.frameCount, 8);
  assert.deepEqual(
    ashaV2PlayerAtlas.rows.find(row => row.name === 'idle')?.frames,
    Array.from({ length: 8 }, (_, index) => `idle_${String(index).padStart(2, '0')}`),
  );
  assert.equal(ashaV2PlayerAtlas.poseSources.idle_00, 'asha-v2-locomotion-source.png:row_0:col_0');
  assert.equal(ashaV2PlayerAtlas.poseSources.idle_07, 'asha-v2-locomotion-source.png:row_0:col_7');
});

test('Egypt Journey keeps marker assets available but removes flag visuals from the route', () => {
  assert.match(journeyMarkerSpritesSource, /MARKER_SPRITE_ATLAS_JSON/);
  assert.match(journeyMarkerSpritesSource, /egypt-checkpoint-flag-sprites\.json/);
  assert.ok(egyptMarkerAtlas.regions.checkpoint_00);
  assert.ok(egyptMarkerAtlas.regions.flag_00);
  assert.match(journeyComponentSource, /loadMarkerSpritePack/);
  assert.match(journeyComponentSource, /DRAW_JOURNEY_FLAG_MARKERS = false/);
  assert.match(journeyComponentSource, /JOURNEY_FLAG_VISUAL_MODE = 'flags-removed-stone-cairns-v1'/);
  assert.match(journeyComponentSource, /if \(!DRAW_JOURNEY_FLAG_MARKERS\) \{[\s\S]*?removedRouteFlagCount \+= 1/);
  assert.match(journeyComponentSource, /const drawFlutterPennant = \(worldX, y, color = '#facc15'\) => \{[\s\S]*?if \(!DRAW_JOURNEY_FLAG_MARKERS\)/);
  assert.match(journeyComponentSource, /const checkpointDrawn = DRAW_JOURNEY_FLAG_MARKERS && drawMarkerSprite\(/);
  assert.match(journeyComponentSource, /journeyFlagVisualMode/);
  assert.match(journeyComponentSource, /removedRouteFlagCount/);
  assert.match(journeyComponentSource, /drawMarkerSprite\([\s\S]*?'flag'/);
  assert.match(journeyComponentSource, /fixedPoleRegion[\s\S]*?flag_00/);
  assert.doesNotMatch(journeyComponentSource, /fillText\('CHECKPOINT'/);
});

test('Egypt opening loop makes the first seal require enemies, shards, and the map objective', () => {
  assert.match(source, /id:\s*'temple-approach-seal'[\s\S]*?name:\s*'Temple Approach Seal'[\s\S]*?shards:\s*4/);
  assert.match(source, /id:\s*'temple-approach-seal'[\s\S]*?id:\s*'desert-seal'/);
  assert.match(source, /id:\s*'desert-seal'[\s\S]*?shards:\s*10/);
  assert.match(source, /id:\s*'map-tablet'[\s\S]*?x:\s*X\(625\)/);
  assert.match(source, /id:\s*'opening-seal-reset-trap'[\s\S]*?x:\s*X\(250\)[\s\S]*?width:\s*87[\s\S]*?height:\s*16/);
  assert.doesNotMatch(source, /id:\s*'opening-spike-floor-trap'/);
  assert.doesNotMatch(source, /id:\s*'warrior-mummy-start-1'/);
  assert.doesNotMatch(source, /id:\s*'warrior-mummy-dune-1'/);
  assert.doesNotMatch(source, /id:\s*'warrior-mummy-ridge-1'/);
  assert.match(source, /id:\s*'scarab-scout-1'[\s\S]*?protectsRouteId:\s*'temple-approach-seal'/);
  assert.match(source, /protectsRouteId:\s*'desert-opening-shard-cache'/);
  assert.match(source, /id:\s*'mummification-chamber-route'[\s\S]*?first sacred mystery/i);
  assert.match(journeyComponentSource, /getActiveShardGateProgress/);
  assert.match(journeyComponentSource, /Relic Shard/);
  assert.match(journeyComponentSource, /Enemy dropped/);
  assert.match(journeyComponentSource, /ENEMY_TYPE_STAKE_MESSAGES/);
  assert.match(journeyComponentSource, /seenEnemyTypeNoticeIds/);
  assert.match(journeyComponentSource, /journey-floating-hud-gate/);
  assert.match(journeyComponentSource, /route-gate-checklist/);
  assert.match(journeyComponentSource, /activeHudGateGuidance\.gateRequirements\.map/);
  assert.match(journeyComponentSource, /activeHudFirstMissing/);
  assert.doesNotMatch(journeyComponentSource, /gateRequirementLabel/);
  assert.match(journeyComponentSource, /journey-collectible-shard-atlas-upgrade-2026-05-21/);
  assert.match(journeyComponentSource, /relicShard:\s*\{[\s\S]*?ringSize:\s*Math\.round\(54 \* PICKUP_GLOW_SCALE\)/);
  assert.match(journeyComponentSource, /key:\s*getRelicShardSpriteKey\(shard\)[\s\S]*?ringKey:\s*'availableGlowRing'/);
  assert.doesNotMatch(journeyComponentSource, /key:\s*'relicShard'[\s\S]*?kind:\s*'shard'/);
  assert.match(journeyCollectibleSpritesSource, /RELIC_SHARD_FRAGMENT_SPRITE_KEYS\s*=\s*\[/);
  assert.match(journeyCollectibleSpritesSource, /getRelicShardSpriteKey\s*=\s*\(shard\)/);
  assert.doesNotMatch(journeyCollectibleSpritesSource, /RELIC_SHARD_FRAGMENT_SPRITE_KEYS\s*=\s*\[[\s\S]*?'relicShard'/);
  [
    'linenMemoryFragment',
    'resinRiteFragment',
    'canopicNameFragment',
    'scarabWingFragment',
    'muralFaienceFragment',
    'muralPlasterFragment',
    'inkNameFragment',
    'witnessLineFragment',
    'royalRecordFragment',
  ].forEach((key) => {
    assert.match(journeyCollectibleSpritesSource, new RegExp(`'${key}'`), `${key} should stay in the collectible atlas contract`);
  });
});

test('ravine bridge route carries an obvious required relic shard above the unsafe drop', () => {
  const bridgeShard = RELIC_SHARDS.find(shard => shard.id === 'shard-2');
  assert.ok(bridgeShard, 'the second visible shard should exist before the first seal');
  assert.equal(bridgeShard.x, scaleJourneyX(525), 'the ravine bridge shard should sit over the upper crossing');
  assert.equal(bridgeShard.y, 365, 'the ravine bridge shard should sit on the bridge deck height, not the unsafe drop');
  assert.equal(bridgeShard.hidden, false, 'the bridge reward should be obvious, not hidden');
  assert.equal(bridgeShard.routeId, null, 'the bridge reward should count toward the required Temple Approach Seal shards');
  const gateHintsStart = journeyComponentSource.indexOf('const GATE_HINTS = {');
  const gateHintsEnd = journeyComponentSource.indexOf('const HAZARD_VISUALS = {', gateHintsStart);
  const gateHintsSource = journeyComponentSource.slice(gateHintsStart, gateHintsEnd);
  assert.match(gateHintsSource, /shards:\s*'Climb the ravine bridge route for the next relic shard; the drop below is not a safe path\.'/);
  assert.doesNotMatch(gateHintsSource, /the lower path is only a recovery route/);
  assert.doesNotMatch(gateHintsSource, /shards:\s*'Search the nearby bridge route and platforms for more relic shards\.'/);
  assert.doesNotMatch(gateHintsSource, /shards:\s*'Search the nearby platforms and lower route for more relic shards\.'/);
});

test('Egypt opening scene uses the existing scarab seal path for a brief Anubis and Asha setup', () => {
  const scarabSealStart = source.indexOf('export const SCARAB_SEAL_TRIGGER = {');
  const scarabSealEnd = source.indexOf('export const HAZARDS = [');
  const scarabSealTrigger = source.slice(scarabSealStart, scarabSealEnd);

  assert.notEqual(scarabSealStart, -1);
  assert.notEqual(scarabSealEnd, -1);
  assert.match(scarabSealTrigger, /eventName:\s*'Anubis'/);
  assert.match(scarabSealTrigger, /'You stand where you should not\.'/);
  assert.match(scarabSealTrigger, /'Leave\.'/);
  assert.match(scarabSealTrigger, /'Asha grips the scarab relic\. The seal trembles, but does not release her\.'/);
  assert.match(scarabSealTrigger, /Restore 4 fragments the seal still recognises/);
  assert.match(scarabSealTrigger, /guideFollowUpLine:\s*'Restore the fragments the seal still recognises\. Survive the guardians\. Prove this place has misjudged you\.'/);
  assert.match(journeyComponentSource, /const OPENING_THRESHOLD_SCENE_DURATION = 14/);
  assert.match(journeyComponentSource, /const OPENING_SPHINX_DURATION = 14/);
  assert.match(journeyComponentSource, /speaker:\s*'Asha',\s*text:\s*ARRIVAL_THRESHOLD_SPAWN_LINE/);
  assert.match(journeyComponentSource, /speaker:\s*'Asha',\s*text:\s*'The world fell away\.'/);
  assert.match(journeyComponentSource, /startOpeningCinematic\(\{ speechEnabled: true, fromArrivalThreshold: true \}\)/);
});

test('Egypt opening archive prologue grounds Asha before the Lost Site transport', () => {
  assert.match(expeditionModeSource, /const EGYPT_ARCHIVE_PROLOGUE_ITEMS = \[/);
  assert.match(expeditionModeSource, /const EGYPT_ARCHIVE_ASSETS = \{/);
  [
    'assets/expedition/opening/archive-prologue/cairo-archive-desk-2026-06-07.png',
    'assets/expedition/opening/archive-prologue/modern-pyramid-scarab-site-2026-06-07.png',
    'assets/expedition/opening/archive-prologue/tomb-painting-photo-2026-06-07.png',
    'assets/expedition/opening/archive-prologue/asha-field-notebook-2026-06-07.png',
  ].forEach((assetPath) => {
    assert.ok(
      existsSync(new URL(`../../../public/${assetPath}`, import.meta.url)),
      `${assetPath} should exist as a project-bound archive prologue PNG`,
    );
    assert.match(expeditionModeSource, new RegExp(assetPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });
  assert.match(expeditionModeSource, /visualSrc:\s*EGYPT_ARCHIVE_ASSETS\.report/);
  assert.match(expeditionModeSource, /visualSrc:\s*EGYPT_ARCHIVE_ASSETS\.painting/);
  assert.match(expeditionModeSource, /visualSrc:\s*EGYPT_ARCHIVE_ASSETS\.notes/);
  assert.match(expeditionModeSource, /src=\{item\.visualSrc\}/);
  assert.match(expeditionModeSource, /src=\{EGYPT_ARCHIVE_ASSETS\.desk\}/);
  assert.match(expeditionModeSource, /id:\s*'tomb-painting-photo'[\s\S]*?Decades-old tomb-painting photograph/i);
  assert.match(expeditionModeSource, /The painting shows this pyramid with a scarab above it/);
  assert.match(expeditionModeSource, /the real pyramid never carried that scarab/i);
  assert.match(expeditionModeSource, /Everyone else treated the photograph as symbolic, mistaken, or too strange to explain\./);
  assert.match(expeditionModeSource, /A memory returns/);
  assert.match(expeditionModeSource, /setExpeditionStage\('journey'\)/);
  assert.match(journeyComponentSource, /The Gate Refuses/);
  assert.match(journeyComponentSource, /A mortal stands beyond my seal\./);
  assert.match(journeyComponentSource, /Forward is judgement\./);
  assert.doesNotMatch(journeyComponentSource, /The past is not treasure to own\. It is memory to protect\./);
  assert.doesNotMatch(journeyComponentSource, /You did not come to take\. Prove it beyond the First Seal\./);
  assert.doesNotMatch(journeyComponentSource, /OPENING_ARCHIVE_EVIDENCE/);
  assert.doesNotMatch(journeyComponentSource, /openingArchiveReviewedCount/);
  assert.doesNotMatch(indexCssSource, /\.opening-archive-card/);
});

test('Egypt archive transport beat uses project-bound cinematic PNGs before Journey handoff', () => {
  assert.match(expeditionModeSource, /const EGYPT_ARCHIVE_TRANSPORT_ASSETS = \{/);
  [
    'assets/expedition/opening/scarab-transport/pyramid-scarab-site-approach-2026-06-07.png',
    'assets/expedition/opening/scarab-transport/scarab-photo-comparison-touch-2026-06-07.png',
    'assets/expedition/opening/scarab-transport/scarab-threshold-opening-2026-06-07.png',
  ].forEach((assetPath) => {
    assert.ok(
      existsSync(new URL(`../../../public/${assetPath}`, import.meta.url)),
      `${assetPath} should exist as a project-bound scarab transport PNG`,
    );
    assert.match(expeditionModeSource, new RegExp(assetPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });
  assert.match(expeditionModeSource, /id:\s*'pyramid-site'[\s\S]*?visualSrc:\s*EGYPT_ARCHIVE_TRANSPORT_ASSETS\.site/);
  assert.match(expeditionModeSource, /id:\s*'scarab-floor-carving'[\s\S]*?visualSrc:\s*EGYPT_ARCHIVE_TRANSPORT_ASSETS\.touch/);
  assert.match(expeditionModeSource, /id:\s*'threshold-opened'[\s\S]*?visualSrc:\s*EGYPT_ARCHIVE_TRANSPORT_ASSETS\.threshold/);
  assert.match(expeditionModeSource, /src=\{cinematicStep\.visualSrc\}/);
  assert.match(expeditionModeSource, /This isn\\'t the excavation site\./);
  assert.match(expeditionModeSource, /setExpeditionStage\('journey'\)/);
  assert.doesNotMatch(expeditionModeSource, /OPENING_TRANSPORT_SCENE/);
  assert.doesNotMatch(journeyComponentSource, /archiveTransportStep/);
});

test('Arrival Threshold becomes a playable bridge between scarab fall and Anubis refusal', () => {
  assert.match(journeyComponentSource, /ARRIVAL_THRESHOLD_BACKGROUND_SRC = 'assets\/expedition\/backgrounds\/arrival-threshold\/arrival-threshold-full-scene-2026-06-08\.png'/);
  assert.match(journeyComponentSource, /ARRIVAL_THRESHOLD_SPAWN_X/);
  assert.match(journeyComponentSource, /ARRIVAL_THRESHOLD_LEFT_BOUND/);
  assert.match(journeyComponentSource, /ARRIVAL_THRESHOLD_FORWARD_GATE_TRIGGER_X/);
  assert.match(journeyUtilsSource, /arrivalThresholdActive:\s*false/);
  assert.match(journeyComponentSource, /completeOpeningThresholdScene[\s\S]*?current\.arrivalThresholdActive = true/);
  assert.match(journeyComponentSource, /current\.notice = ARRIVAL_THRESHOLD_OBJECTIVE_LINE/);
  assert.match(journeyComponentSource, /current\.openingSphinxEncounter = null/);
  assert.match(journeyComponentSource, /startOpeningCinematic\(\{ speechEnabled: true, fromArrivalThreshold: true \}\)/);
  assert.match(journeyComponentSource, /current\.arrivalThresholdActive = false[\s\S]*?current\.openingCinematic = \{/);
  assert.match(journeyComponentSource, /drawArrivalThresholdScene\(ctx, current, now\)/);
  assert.match(journeyComponentSource, /arrivalThresholdState:/);
  assert.match(journeyComponentSource, /The pyramid\.\.\. where is it\?/);
  assert.match(journeyComponentSource, /The way back is sealed\./);
  assert.match(journeyComponentSource, /But I'm not dead\./);
});

test('low-quality generated sacred trap pack is not part of the live asset contract', () => {
  assert.equal(
    existsSync(new URL('../../../public/assets/expedition/environment/desert-temple/egypt-sacred-traps-pack.json', import.meta.url)),
    false,
  );
  assert.equal(
    existsSync(new URL('../../../public/assets/expedition/environment/desert-temple/egypt-sacred-traps-pack.png', import.meta.url)),
    false,
  );
  assert.doesNotMatch(journeyRenderAssetsSource, /EGYPT_SACRED_TRAPS|guardianSealIdle|sacredPedestalIdle/);
  assert.doesNotMatch(expeditionStagesSource, /egypt-sacred-traps-pack/);
  assert.doesNotMatch(journeyComponentSource, /sacredTrapEnvironmentAssetsRef|EGYPT_SACRED_TRAPS/);
});

test('Guardian Seal passive placement uses existing story props without the removed sacred defence atlas', () => {
  const storyProps = extractExportedArray('STORY_PROPS');

  assert.match(storyProps, /id:\s*'guardian-seal-pedestal-passive'[\s\S]*?sectionId:\s*'dig-site-entrance'[\s\S]*?type:\s*'sacred-pedestal'[\s\S]*?x:\s*X\(8190\)[\s\S]*?y:\s*JY\(306\)/);
  assert.match(storyProps, /id:\s*'guardian-seal-passive'[\s\S]*?sectionId:\s*'dig-site-entrance'[\s\S]*?type:\s*'guardian-seal'[\s\S]*?x:\s*X\(8190\)[\s\S]*?y:\s*JY\(286\)/);
  assert.doesNotMatch(journeyRenderAssetsSource, /'sacred-pedestal':\s*'sacredPedestalIdle'/);
  assert.doesNotMatch(journeyRenderAssetsSource, /'guardian-seal':\s*'guardianSealIdle'/);
  assert.doesNotMatch(journeyComponentSource, /guardian-seal-trigger/);
  assert.doesNotMatch(journeyComponentSource, /guardian-seal-passive' && scarabSealActivated/);
  assert.doesNotMatch(journeyComponentSource, /guardian-seal-pedestal-passive' && scarabSealActivated/);
});

test('Egypt Journey explains shard purpose and adds an optional Base Camp voucher cache', () => {
  assert.doesNotMatch(extractExportedArray('STORY_PROPS'), /id:\s*'relic-shard-purpose-note'/);
  assert.match(source, /Restore the fragments the seal still recognises\. Pass the guardians\. The site will test you\./);
  assert.match(source, /id:\s*'basecamp-upgrade-voucher'[\s\S]*?shardCost:\s*2[\s\S]*?rewardShards:\s*6[\s\S]*?cacheReward:\s*true/);
  assert.match(source, /id:\s*'desert-entry-premium-column-1'/);
  assert.match(journeyComponentSource, /Cache opened! Upgrade Voucher earned/);
  assert.match(journeyComponentSource, /journey-floating-hud-gems/);
  assert.match(journeyComponentSource, /is-rewarding/);
});

test('Egypt Journey loads visible sprites for all default Egypt enemy families', () => {
  assert.match(journeyEnemySpritesSource, /WITHHELD_EGYPT_CREATURE_SPRITE_FAMILIES/);
  assert.match(journeyEnemySpritesSource, /WITHHELD_EGYPT_CREATURE_SPRITE_FAMILIES = new Set\(\[\s*'cursedStatue',\s*\]\)/);
  assert.match(journeyEnemySpritesSource, /stone-guardian-enemy-sprites-premium-2026-06-02\.json/);
  assert.match(journeyEnemySpritesSource, /DESERT_SCARAB_SPRITE_ATLAS_JSON/);
  assert.match(journeyEnemySpritesSource, /SAND_SNAKE_SPRITE_ATLAS_JSON/);
  assert.match(journeyEnemySpritesSource, /SCORPION_SPRITE_ATLAS_JSON/);
  assert.match(journeyEnemySpritesSource, /SAND_WISP_SPRITE_ATLAS_JSON/);
  assert.match(journeyEnemySpritesSource, /WARRIOR_MUMMY_SPRITE_ATLAS_JSON/);
  assert.match(journeyEnemySpritesSource, /EXPECTED_WARRIOR_MUMMY_SPRITE_KEYS/);
  assert.match(journeyEnemySpritesSource, /ENEMY_VISUAL_SIZE_MULTIPLIER = 1\.5/);
  assert.match(journeyEnemySpritesSource, /ENEMY_VISUAL_SIZE_MULTIPLIERS = \{/);
  assert.match(journeyEnemySpritesSource, /ENEMY_SPRITE_GROUNDING_VERSION = 'enemy-sprite-grounding-2026-05-18'/);
  assert.match(journeyEnemySpritesSource, /scarab:\s*defeated \? 16 : 14/);
  assert.match(journeyEnemySpritesSource, /scorpion:\s*defeated \? 18 : 15/);
  assert.match(journeyEnemySpritesSource, /restoredTwoPoseWalkFamilies/);
  assert.match(journeyEnemySpritesSource, /new Set\(\['scarab', 'snake', 'bat'\]\)/);
  assert.match(journeyEnemySpritesSource, /shouldUseEnemySpritePack/);
  assert.match(journeyComponentSource, /if\s*\(!shouldUseEnemySpritePack\(enemy\)\)\s*return false/);
  assert.match(journeyComponentSource, /enemy\.type === 'guardian' \|\| enemy\.type === 'statue'/);
  assert.match(journeyComponentSource, /getBossSpritePack\(bossSpriteAssetsRef\.current, bossId\)/);
  assert.match(journeyComponentSource, /enemy\.type === 'scarab'/);
  assert.match(journeyComponentSource, /enemy\.type === 'snake'/);
  assert.match(journeyComponentSource, /enemy\.type === 'scorpion'/);
  assert.match(journeyComponentSource, /enemy\.type === 'sand-wisp'/);
  assert.match(journeyEnemySpritesSource, /if \(enemy\.type === 'mummy' \|\| name\.includes\('mummy'\)\) return 'mummy'/);
});

test('guardian knowledge quizzes stay available but are no longer used by boss fights', () => {
  assert.match(source, /export const GUARDIAN_KNOWLEDGE_QUESTIONS = \[/);
  assert.match(source, /export const GUARDIAN_KNOWLEDGE_CHALLENGES = \{/);
  assert.match(source, /question:\s*'What is an artefact\?'/);
  assert.match(journeyComponentSource, /const GUARDIAN_KNOWLEDGE_CHALLENGES_ENABLED = false;/);
  assert.match(
    journeyComponentSource,
    /const guardianQuestions = GUARDIAN_KNOWLEDGE_CHALLENGES_ENABLED && !current\.completedGuardianChallengeIds\?\.has\(b\.id\)/,
  );
});

test('Broken Ruins Route extends the Egypt opening with existing platformer systems', () => {
  const platforms = extractExportedArray('PLATFORMS');
  const hazards = extractExportedArray('HAZARDS');
  const shards = source.slice(source.indexOf('const RELIC_SHARD_LAYOUT = ['), source.indexOf('export const RELIC_SHARDS'));
  const storyProps = extractExportedArray('STORY_PROPS');
  const events = extractExportedArray('ENVIRONMENT_EVENTS');
  const hiddenRoutes = extractExportedArray('HIDDEN_ROUTES');

  [
    'broken ruins route entry',
    'half-buried lintel',
    'ruins recovery step',
  ].forEach((label) => {
    assert.doesNotMatch(platforms, new RegExp(label));
  });
  assert.match(hazards, /broken-ruins-loose-stones/);
  assert.match(hazards, /Loose ruin stones shifted underfoot/);
  assert.match(shards, /\{\s*x:\s*2365,\s*y:\s*320\s*\}/);
  assert.doesNotMatch(storyProps, /broken-ruins-route-stones/);
  assert.doesNotMatch(storyProps, /Broken Ruins Route trail marker/);
  assert.match(storyProps, /generated premium carved fallen column in open sand after the pyramid/);
  assert.doesNotMatch(storyProps, /survey rope beside half-buried structure/);
  assert.match(events, /id:\s*'broken-ruins-route'/);
  assert.match(events, /Collapsed stones mark a careful route deeper toward the tomb/);
  assert.doesNotMatch(hiddenRoutes, /broken-ruins-route/);
});

test('Sandfall Collapsing Stone section adds a fair hazard beat after Broken Ruins', () => {
  const platforms = extractExportedArray('PLATFORMS');
  const hazards = extractExportedArray('HAZARDS');
  const shards = source.slice(source.indexOf('const RELIC_SHARD_LAYOUT = ['), source.indexOf('export const RELIC_SHARDS'));
  const storyProps = extractExportedArray('STORY_PROPS');
  const events = extractExportedArray('ENVIRONMENT_EVENTS');
  const hiddenRoutes = extractExportedArray('HIDDEN_ROUTES');

  [
    'sandfall warning slab',
    'collapsing column step',
    'buried recovery stair',
  ].forEach((label) => {
    assert.match(platforms, new RegExp(label));
  });
  assert.match(hazards, /sandfall-warning-dust/);
  assert.match(hazards, /falling sand warned that the stones ahead were unstable/i);
  assert.match(hazards, /sandfall-collapsing-stones/);
  assert.match(hazards, /penalty:\s*\{\s*stamina:\s*8,\s*time:\s*3\s*\}/);
  assert.match(hazards, /sandfall-soft-pit/);
  assert.match(shards, /\{\s*x:\s*2025,\s*y:\s*238\s*\}/);
  assert.match(storyProps, /sandfall-warning-marker/);
  assert.match(storyProps, /broken column shedding sand/);
  assert.match(storyProps, /survey rope around unstable stones/);
  assert.match(events, /id:\s*'sandfall-collapsing-stone-section'/);
  assert.match(events, /Falling sand marks unstable stones before the deeper temple route\./);
  assert.doesNotMatch(hiddenRoutes, /sandfall/);
});

test('Temple Threshold route keeps the first switch readable without clutter platforms', () => {
  const platforms = extractExportedArray('PLATFORMS');
  const hazards = extractExportedArray('HAZARDS');
  const shards = source.slice(source.indexOf('const RELIC_SHARD_LAYOUT = ['), source.indexOf('export const RELIC_SHARDS'));
  const storyProps = extractExportedArray('STORY_PROPS');
  const events = extractExportedArray('ENVIRONMENT_EVENTS');
  const markers = extractExportedArray('OBJECTIVE_MARKERS');

  [
    'temple threshold safe plinth',
    'entry pause step',
    'temple plinth',
    'switch teaching plinth',
    'fallen block step',
    'carved seal step',
  ].forEach((label) => {
    assert.doesNotMatch(platforms, new RegExp(label));
  });
  assert.match(hazards, /temple-threshold-hairline-crack/);
  assert.match(hazards, /penalty:\s*\{\s*time:\s*3\s*\}/);
  assert.match(hazards, /A hairline crack warned the team to step carefully\./);
  [
    /\{\s*x:\s*1548,\s*y:\s*320\s*\}/,
    /\{\s*x:\s*1638,\s*y:\s*320\s*\}/,
    /\{\s*x:\s*1748,\s*y:\s*320\s*\}/,
  ].forEach((rewardPoint) => {
    assert.match(shards, rewardPoint);
  });
  assert.match(storyProps, /temple-threshold-switch-trail/);
  [
    'atmosphere-temple-entry-pillar',
    'temple-approach-obelisk-fragment-1',
    'temple-threshold-crack-cue',
    'atmosphere-temple-tablet',
    'ruined-temple-relief-slab-1',
    'temple-door',
    'carved-stone-clue',
    'mural-wall',
    'ruined-temple-mural-fragment-2',
  ].forEach((id) => {
    assert.doesNotMatch(storyProps, new RegExp(`id:\\s*'${id}'`));
  });
  assert.match(events, /id:\s*'temple-threshold-climb'/);
  assert.match(events, /Relic shards mark the way toward the first switch\./);
  assert.match(markers, /id:\s*'switch-1'/);
  assert.match(markers, /x:\s*X\(2625\)/);
});

test('Switch 1 creates a visible temple mechanism response through existing Journey systems', () => {
  const platforms = extractExportedArray('PLATFORMS');
  assert.match(platforms, /id:\s*'switch-1-raised-return-plinth'/);
  assert.match(platforms, /label:\s*'switch raised return plinth'/);
  assert.match(platforms, /requiresObjective:\s*'switch-1'/);
  assert.match(journeyComponentSource, /const isPlatformAvailable = \(platform, current\) =>/);
  assert.match(journeyComponentSource, /platform\.requiresObjective/);
  assert.match(journeyComponentSource, /current\.collectedObjectiveIds\.has\(platform\.requiresObjective\)/);
  assert.match(journeyComponentSource, /visibleMechanismPlatforms/);
  assert.match(journeyComponentSource, /Stone mechanism activated\. Switches 1\/3\. A return plinth rises\./);
  assert.match(journeyComponentSource, /switch-1-response/);
  assert.match(journeyComponentSource, /A return plinth rises ahead\./);
});

test('early route gates avoid filler enemy requirements while preserving enemy-clear support for later routes', () => {
  const routeGates = extractExportedArray('ROUTE_GATES');
  const enemies = extractExportedArray('ENEMIES');

  assert.doesNotMatch(routeGates, /id:\s*'temple-approach-seal'[\s\S]*?enemies:\s*\[\s*'scarab-scout-1'\s*\]/);
  assert.doesNotMatch(routeGates, /id:\s*'guardian-prep-seal'[\s\S]*?enemies:\s*\[\s*'sand-wisp-start-1',\s*'sand-wisp-ledge-1'\s*\]/);
  assert.doesNotMatch(routeGates, /id:\s*'temple-seal'[\s\S]*?enemies:\s*\[\s*'warrior-mummy-threshold-1'\s*\]/);
  assert.doesNotMatch(enemies, /id:\s*'scarab-survey-1'/);
  assert.match(enemies, /id:\s*'scarab-scout-1'[\s\S]*?protectsRouteId:\s*'temple-approach-seal'/);
  assert.match(enemies, /id:\s*'sand-wisp-start-1'[\s\S]*?protectsRouteId:\s*'desert-upper-survey-route'/);
  assert.match(enemies, /id:\s*'sand-wisp-ledge-1'[\s\S]*?protectsRouteId:\s*'guardian-prep-seal'/);
  assert.match(journeyComponentSource, /requirements\.enemies/);
  assert.match(journeyComponentSource, /current\.defeatedEnemies\?\.has\(enemyId\)/);
  assert.match(journeyComponentSource, /type:\s*'enemyClear'/);
});

test('early verticality keeps required Map Tablet progress grounded while optional chamber climbs stay invisible', () => {
  const platforms = extractExportedArray('PLATFORMS');
  const markers = extractExportedArray('OBJECTIVE_MARKERS');
  const shards = source.slice(source.indexOf('const RELIC_SHARD_LAYOUT = ['), source.indexOf('export const RELIC_SHARDS ='));

  [
    'mummification-chamber-bottom-secret-threshold',
    'mummification-chamber-sand-buried-block',
    'mummification-chamber-far-left-ground-shelf',
    'mummification-chamber-left-lower-terrace',
    'mummification-chamber-left-sandstone-shelf',
    'mummification-chamber-left-column-cap',
    'mummification-chamber-central-left-shelf',
    'mummification-chamber-central-drop-slab',
    'mummification-chamber-carved-lower-ledge',
    'mummification-chamber-right-low-landing',
    'mummification-chamber-right-stair-landing',
    'mummification-chamber-right-column-cap',
    'mummification-chamber-upper-rite-ledge',
    'mummification-chamber-left-doorway-ledge',
    'mummification-chamber-upper-left-platform',
    'mummification-chamber-upper-right-platform',
    'mummification-chamber-doorway-floor',
  ].forEach((id) => {
    assert.match(platforms, new RegExp(`id:\\s*'${id}'[\\s\\S]*?invisible:\\s*true`));
    assert.doesNotMatch(getDataRowById(platforms, id), /assetKey:\s*'sandstoneBlock'/);
  });
  [
    'desert-broken-ruin-lower-climb',
    'desert-broken-ruin-middle-climb',
    'desert-broken-ruin-tablet-ledge',
    'desert-broken-ruin-upper-ledge',
    'desert-seal-warden-ledge',
    'desert-false-relic-lower-step',
    'desert-false-relic-middle-step',
    'desert-false-relic-high-step',
    'guardian-prep-warden-ledge',
    'temple-approach-switch-ledge',
  ].forEach((id) => {
    assert.doesNotMatch(platforms, new RegExp(`id:\\s*'${id}'`));
  });
  assert.match(getDataRowById(markers, 'map-tablet'), /y:\s*GROUND_Y - 46/);
  assert.match(getDataRowById(markers, 'map-tablet'), /groundedProp:\s*true/);
  assert.match(shards, /\{\s*x:\s*590,\s*y:\s*226\s*\}/);
});

test('first mini-boss is gated by preparation and rewards the next route', () => {
  const routeGates = extractExportedArray('ROUTE_GATES');
  const storyProps = extractExportedArray('STORY_PROPS');
  const events = extractExportedArray('ENVIRONMENT_EVENTS');

  assert.match(routeGates, /id:\s*'guardian-prep-seal'/);
  assert.match(routeGates, /name:\s*'Guardian Prep Seal'/);
  assert.match(routeGates, /x:\s*X\(1115\)/);
  assert.match(routeGates, /requires:\s*\{\s*objective:\s*'desert-entry'[\s\S]*?shards:\s*6/);
  assert.match(routeGates, /id:\s*'guardian-prep-seal'[\s\S]*?id:\s*'desert-seal'/);
  assert.match(routeGates, /readyHint:\s*'The Desert Map Seal opens\. Carry the record forward into the ruined temple\.'/);
  assert.match(source, /routeOpenMessage:\s*'The Scarab Queen falls\. Asha has permission, not trust\. Brush Handle recovered\. The Desert Map Seal answers\.'/);
  assert.match(source, /id:\s*'scarab-queen'[\s\S]*?arenaStart:\s*X\(2020\)/);
  assert.match(source, /id:\s*'scarab-queen'[\s\S]*?name:\s*'Scarab Queen'/);
  assert.doesNotMatch(storyProps, /Guardian Prep Seal: read Map Tablet and restore 6 relic shards/);
  assert.match(storyProps, /generated premium pillar-cap ruins in open sand after the pyramid/);
  assert.match(events, /The seal ahead is locked\. If the Map Tablet is unread, turn back/);
  assert.match(journeyComponentSource, /Collect the tool piece, then return to \$\{routeGateName \|\| 'the route gate'\}/);
  assert.match(journeyComponentSource, /current\.notice = `\$\{b\.name\} defeated\. \$\{rewardMoment\.title\} \$\{rewardMoment\.nextObjective\}`/);
  assert.match(journeyComponentSource, /current\.notice = `\$\{rewardMoment\.title\} \$\{rewardMoment\.nextObjective\}`/);
});

test('active boss domains suppress normal enemy noise near the guardian arena', () => {
  assert.match(journeyComponentSource, /const BOSS_DOMAIN_ENEMY_FOCUS_PADDING = 96/);
  assert.match(journeyComponentSource, /const SCARAB_QUEEN_ENEMY_FOCUS_PADDING = 220/);
  assert.match(journeyComponentSource, /const isNormalEnemyInsideBossFocus = \(enemy, bossDomain\) =>/);
  assert.match(journeyComponentSource, /bossDomain\.bossId === SCARAB_SEAL_TRIGGER\.bossId[\s\S]*?\? SCARAB_QUEEN_ENEMY_FOCUS_PADDING[\s\S]*?: BOSS_DOMAIN_ENEMY_FOCUS_PADDING/);
  assert.match(journeyComponentSource, /current\.bossDomain[\s\S]*?!current\.defeatedMiniBosses\.has\(current\.bossDomain\.bossId\)[\s\S]*?isNormalEnemyInsideBossFocus\(e, activeBossDomain\)/);
  assert.match(journeyComponentSource, /suppressEnemyForBossFocus\(e\);[\s\S]*?return;/);
  assert.match(journeyCombatContractSource, /const suppressEnemyForBossFocus = \(enemy\) => \{[\s\S]*?enemy\.attackWindup = 0;[\s\S]*?enemy\.attackTimer = 0;[\s\S]*?enemy\.aggroMemoryTimer = 0;/);
  assert.match(journeyComponentSource, /current\.enemies\.forEach\(\(enemy\) => \{[\s\S]*?if \(!enemy\.defeated && isNormalEnemyInsideBossFocus\(enemy, activeBossDomain\)\) return;/);
});

test('Scarab Queen boss intro is staged as a buried-sand emergence cinematic', () => {
  const miniBosses = extractExportedArray('MINI_BOSSES');
  const lairOpeningProp = new URL('../../../public/assets/expedition/bosses/scarab-queen-buried-lair-opening.png', import.meta.url);

  assert.ok(existsSync(lairOpeningProp), 'buried scarab lair opening should exist as a transparent PNG runtime asset');
  assert.match(source, /bossIntroLine:\s*'The buried scarab lair splits open beneath the sand\. The Scarab Queen rises as Anubis/);
  assert.match(miniBosses, /id:\s*'scarab-queen'[\s\S]*?intro:/);
  assert.match(journeyComponentSource, /const SCARAB_QUEEN_INTRO_TRIGGER_DISTANCE = 220/);
  assert.match(journeyComponentSource, /const SCARAB_QUEEN_EMERGENCE_INTRO_SECONDS = 6\.8/);
  assert.doesNotMatch(journeyComponentSource, /SCARAB_QUEEN_TRIGGER_LOOTER_OFFSET/);
  assert.match(journeyComponentSource, /const SCARAB_QUEEN_CINEMATIC_CAMERA_ANCHOR_RATIO = 0\.72/);
  assert.match(journeyComponentSource, /const SCARAB_QUEEN_LAIR_OPENING_IMAGE_SRC = 'assets\/expedition\/bosses\/scarab-queen-buried-lair-opening\.png'/);
  assert.match(useJourneyRendererSource, /export function drawScarabQueenLairOpeningPropFrame/);
  assert.match(useJourneyRendererSource, /width.*crack \* 64/);
  assert.match(journeyComponentSource, /const getScarabQueenEmergenceBeat = \(introProgress\) =>/);
  assert.match(journeyComponentSource, /buriedSealCrack:/);
  assert.match(journeyComponentSource, /glyphGlow:/);
  assert.match(journeyComponentSource, /sandEruption:/);
  assert.match(journeyComponentSource, /queenRise:/);
  assert.match(journeyComponentSource, /buriedSandEmergence:\s*scarabQueenCinematic/);
  assert.match(journeyComponentSource, /introSeconds:\s*scarabQueenCinematic \? SCARAB_QUEEN_EMERGENCE_INTRO_SECONDS : 3\.2/);
  assert.match(journeyComponentSource, /title:\s*scarabQueenCinematic \? `Buried Lair: \$\{b\.name\}` : `Guardian Encounter: \$\{b\.name\}`/);
  assert.match(journeyComponentSource, /triggerActor:\s*scarabQueenCinematic \? 'Buried Scarab Lair' : null/);
  assert.match(journeyComponentSource, /triggerLine:\s*scarabQueenCinematic \? 'The lair mouth splits open\. Something ancient is rising\.' : null/);
  assert.match(journeyComponentSource, /cameraAnchorRatio:\s*scarabQueenCinematic \? SCARAB_QUEEN_CINEMATIC_CAMERA_ANCHOR_RATIO : null/);
  assert.match(journeyComponentSource, /const bossIntroTriggerDistance = scarabSealRequired \? SCARAB_QUEEN_INTRO_TRIGGER_DISTANCE : 400/);
  assert.doesNotMatch(journeyComponentSource, /LAIR OPENS|QUEEN RISES|FIELD TEAM/);
  assert.match(useJourneyRendererSource, /const buriedSandEmergenceActive = Boolean\(activeBossDomain\?\.buriedSandEmergence && introActive\)/);
  assert.match(useJourneyRendererSource, /cinematicBeat:\s*buriedSandEmergenceActive \? getScarabQueenEmergenceBeat\(introProgress\) : null/);
  assert.doesNotMatch(journeyComponentSource, /id:\s*'scarab-queen-trigger-looter'[\s\S]*?type:\s*'looter'/);
  assert.match(useJourneyRendererSource, /if \(boss\.id === 'scarab-queen' && bossVisualState\?\.buriedSandEmergence && bossVisualState\.cinematicBeat\?\.queenRise <= 0\) return false;/);
  assert.match(journeyComponentSource, /if \(isBuriedScarabQueen && current\.bossDomain\?\.bossId === boss\.id\) \{[\s\S]*?drawScarabQueenLairOpeningProp\(ctx,/);
  assert.match(journeyComponentSource, /SCARAB_QUEEN_EMERGENCE_INTRO_SECONDS[\s\S]*?current\.bossIntro = \{[\s\S]*?title:\s*`Buried Lair: \$\{boss\.name\}`/);
  assert.match(journeyComponentSource, /target === 'journey-boss-intro-progress'/);
  assert.match(journeyComponentSource, /const bossIntroActive = current\.bossIntro\?\.id === boss\.id;[\s\S]*?if \(!bossIntroActive\) drawEnemyAttackTell/);
  assert.match(useJourneyRendererSource, /ctx\.fillStyle = 'rgba\(0,0,0,0\.62\)';\s*ctx\.beginPath\(\);\s*ctx\.roundRect\(barX, barY, barWidth, barHeight, 5\);[\s\S]*?ctx\.fillStyle = boss\.awakened \? '#dc2626' : '#b45309';\s*ctx\.beginPath\(\);\s*ctx\.roundRect\(barX, barY, \(boss\.health \/ boss\.maxHealth\) \* barWidth, barHeight, 5\);/);
  assert.match(journeyComponentSource, /activeBossDomainForObjectiveMarkers\.arenaStart \?\? -Infinity/);
  assert.match(journeyComponentSource, /const domainAtmosphere = ctx\.createRadialGradient/);
  assert.doesNotMatch(
    journeyComponentSource,
    /ctx\.fillRect\(Math\.max\(0, domainStartX\), 0, Math\.min\(CANVAS_WIDTH, domainWidth\), CANVAS_HEIGHT\)/,
    'boss arena visuals should not draw a hard full-height rectangle over the desert backdrop',
  );
  assert.match(journeyComponentSource, /const bossDomainHudSuppressed = gameState\.bossDomain[\s\S]*?const activeHudGate = bossDomainHudSuppressed[\s\S]*?\? null[\s\S]*?: getNextJourneyRouteGate\(ROUTE_GATES, gameState\)/);
  assert.match(journeyComponentSource, /const activeBossDomainForObjectiveMarkers = current\.bossDomain[\s\S]*?if \(!chamberSceneActive && !current\.arrivalThresholdActive && !activeBossDomainForObjectiveMarkers\) drawMissingObjectiveMarker/);
});

test('Expedition map avoids artificial in-world canvas text labels', () => {
  const drawStart = expeditionModeSource.indexOf('const draw = useCallback(() => {');
  const drawEnd = expeditionModeSource.indexOf('const update = useCallback', drawStart);
  const expeditionMapDrawSource = expeditionModeSource.slice(drawStart, drawEnd);

  assert.notEqual(drawStart, -1, 'Expedition map draw callback should exist');
  assert.notEqual(drawEnd, -1, 'Expedition map update callback should follow draw callback');
  assert.match(expeditionMapDrawSource, /closedGateSlab/);
  assert.match(expeditionMapDrawSource, /exitArch/);
  assert.doesNotMatch(expeditionMapDrawSource, /ctx\.fillText\(/);
  assert.doesNotMatch(expeditionMapDrawSource, /pinnedFieldLabel|surveyTag/);
  assert.doesNotMatch(expeditionMapDrawSource, /Dig zone marked|Surveyed|Survey ready|Check needed/);
  assert.doesNotMatch(expeditionMapDrawSource, /'OPEN'|'LOCKED'|'YOU'/);
  assert.doesNotMatch(expeditionMapDrawSource, /lockedSealIcon|unlockedSealIcon/);
});

test('Journey progress gates use arch and slab assets instead of artificial padlock markers', () => {
  const drawStart = journeyComponentSource.indexOf('const drawRouteGate = useCallback');
  const drawEnd = journeyComponentSource.indexOf('const drawHazardBurialCover = useCallback', drawStart);
  const routeGateDrawSource = journeyComponentSource.slice(drawStart, drawEnd);

  assert.notEqual(drawStart, -1, 'Journey route gate renderer should exist');
  assert.notEqual(drawEnd, -1, 'Hazard renderer should follow route gate renderer');
  assert.match(journeyComponentSource, /ROUTE_GATE_BACK_SRC = 'assets\/expedition\/environment\/egypt-opening\/route-gate-back\.png'/);
  assert.match(journeyComponentSource, /ROUTE_GATE_FRONT_SRC = 'assets\/expedition\/environment\/egypt-opening\/route-gate-front\.png'/);
  assert.match(journeyComponentSource, /ROUTE_GATE_SLAB_SRC = 'assets\/expedition\/environment\/egypt-opening\/route-gate-slab\.png'/);
  assert.match(journeyComponentSource, /ROUTE_GATE_ASSET_VERSION = 'imagegen-egypt-route-gate-arch-column-slab-2026-05-31'/);
  assert.match(routeGateDrawSource, /drawGateAsset\(routeGateSlabRef/);
  assert.match(routeGateDrawSource, /drawGateAsset\(routeGateBackRef/);
  assert.match(routeGateDrawSource, /drawGateAsset\(routeGateFrontRef/);
  assert.match(routeGateDrawSource, /if \(gate\.suppressRouteGateVisual\) return;/);
  assert.match(routeGateDrawSource, /frontPillarPassageOffset = -Math\.round\(frontWidth \* 0\.37\)/);
  assert.match(routeGateDrawSource, /x: gateCenter - Math\.round\(frontWidth \/ 2\) \+ frontPillarPassageOffset/);
  assert.match(routeGateDrawSource, /flipX:\s*true/);
  assert.match(routeGateDrawSource, /layer === 'foreground'[\s\S]*?if \(complete\)/);
  assert.match(useJourneyRendererSource, /drawMissingObjectiveMarkerFrame[\s\S]*?nearestMissingObjective/);
  assert.match(journeyComponentSource, /status\.complete/);
  assert.doesNotMatch(routeGateDrawSource, /drawFieldNoteLabel|gateRequirementLabel|gate\.name/);
  assert.doesNotMatch(routeGateDrawSource, /ctx\.arc\(gateCenter[\s\S]*?ctx\.fillRect\(gateCenter - 7/);
});

test('Journey route gates use doorway anchors so linked seals draw as one blocked path', () => {
  const drawStart = journeyComponentSource.indexOf('const drawRouteGate = useCallback');
  const drawEnd = journeyComponentSource.indexOf('const drawHazardBurialCover = useCallback', drawStart);
  const routeGateDrawSource = journeyComponentSource.slice(drawStart, drawEnd);
  const collisionStart = journeyComponentSource.indexOf('// Gates');
  const collisionEnd = journeyComponentSource.indexOf('// Final Goal', collisionStart);
  const routeGateCollisionSource = journeyComponentSource.slice(collisionStart, collisionEnd);

  assert.match(journeyDataRouterSource, /ROUTE_GATE_DOORWAYS = makeProxy/);
  assert.match(journeyComponentSource, /ROUTE_GATE_DOORWAYS/);
  assert.match(journeyComponentSource, /getRouteGateDoorwayEntries/);
  assert.match(journeyComponentSource, /getDoorwayGateStatus/);
  assert.match(routeGateDrawSource, /doorway\?\.anchorX/);
  assert.match(routeGateDrawSource, /frontDest[\s\S]*?gateCenter - Math\.round\(frontWidth \/ 2\)/);
  assert.doesNotMatch(routeGateDrawSource, /gateCenter - frontWidth - 50/);
  assert.match(journeyComponentSource, /getRouteGateDoorwayEntries\(\)\.forEach/);
  assert.match(routeGateCollisionSource, /getRouteGateDoorwayEntries\(\)\.forEach/);
  assert.match(routeGateCollisionSource, /const blockX = doorway\?\.blockX \?\? activeGate\.x/);
  assert.match(routeGateCollisionSource, /status\.gatesToOpen\.forEach\(gateToOpen => current\.openedRouteGateIds\.add\(gateToOpen\.id\)\)/);
  assert.doesNotMatch(routeGateCollisionSource, /ROUTE_GATES\.forEach\(g =>/);
});

test('Egypt chamber entry triggers render as configurable premium doors outside debug overlay', () => {
  assert.match(journeyComponentSource, /createChamberDoorVisuals = \(\{/);
  assert.match(journeyComponentSource, /const CHAMBER_DOOR_VISUALS = createChamberDoorVisuals\(\{/);
  assert.match(journeyComponentSource, /DESERT_ENTRY_RETIRED_CHAMBER_DOOR_VISUAL_IDS = new Set\(\[[\s\S]*?'mummification-chamber-entry-door'/);
  [
    'mummification-chamber-entry-door',
    'forgotten-mural-entry-door',
    'scribe-chamber-entry-door',
  ].forEach((id) => assert.match(journeyComponentSource, new RegExp(`id:\\s*'${id}'`)));

  const chamberDoorVisuals = getComponentFunctionSource('drawPremiumEgyptianChamberDoor');
  assert.match(chamberDoorVisuals, /shouldRenderChamberDoorVisual\(door\)[\s\S]*?return/);
  assert.match(chamberDoorVisuals, /hieroglyphs/i);
  assert.match(chamberDoorVisuals, /sealed slab/i);
  assert.match(chamberDoorVisuals, /ankh|scarab/i);
  assert.match(chamberDoorVisuals, /gold rim/i);
  assert.match(chamberDoorVisuals, /dust/i);
  assert.match(chamberDoorVisuals, /Inspect Door|E Enter/);

  const drawStart = journeyComponentSource.indexOf('const draw = useCallback');
  const drawEnd = journeyComponentSource.indexOf('const startOpeningCinematic = useCallback', drawStart);
  assert.notEqual(drawStart, -1, 'draw should exist');
  assert.notEqual(drawEnd, -1, 'draw should end before startOpeningCinematic');
  const drawSource = journeyComponentSource.slice(drawStart, drawEnd);
  assert.match(drawSource, /CHAMBER_DOOR_VISUALS[\s\S]*?resolveChamberEntryTrigger\(door\)[\s\S]*?drawPremiumEgyptianChamberDoor/);
  assert.match(drawSource, /drawPremiumEgyptianChamberDoor/);
  assert.match(journeyComponentSource, /CHAMBER_DOOR_VISUALS_BY_ID\['mummification-chamber-entry-door'\]/);

  const editorOverlayStart = useJourneyRendererSource.indexOf('export function drawPropPlacementEditorOverlayFrame');
  const editorOverlayEnd = useJourneyRendererSource.indexOf('export function useJourneyRenderer', editorOverlayStart);
  assert.notEqual(editorOverlayStart, -1, 'drawPropPlacementEditorOverlay should exist');
  assert.notEqual(editorOverlayEnd, -1, 'drawPropPlacementEditorOverlay should end before draw');
  const editorOverlaySource = useJourneyRendererSource.slice(editorOverlayStart, editorOverlayEnd);
  assert.match(editorOverlaySource, /if \(!import\.meta\.env\.DEV \|\| !editor\.enabled\) return/);
  assert.match(editorOverlaySource, /Chamber entry trigger zones/);
  assert.match(editorOverlaySource, /rgba\(45, 212, 191/);
});

test('Scarab Queen approach builds dread before the lair emergence', () => {
  const egyptEnemies = extractExportedArray('ENEMIES');
  const events = extractExportedArray('ENVIRONMENT_EVENTS');

  assert.match(egyptEnemies, /id:\s*'scorpion-warning-1'[\s\S]*?name:\s*'Lair Warden Scorpion'[\s\S]*?encounterRole:\s*'lair approach pressure'/);
  assert.match(egyptEnemies, /id:\s*'snake-1'[\s\S]*?name:\s*'Buried Lair Snake'[\s\S]*?encounterRole:\s*'lair approach pressure'/);
  assert.match(events, /id:\s*'scarab-queen-lair-dread-wind'[\s\S]*?message:\s*'A low wind pulls sand toward something buried ahead\.'/);
  assert.match(appSource, /scarabQueenApproachAtmosphere:\s*\{[\s\S]*?opening-desert-wind\.ogg[\s\S]*?opening-deep-rumble\.ogg/);
  assert.match(journeyComponentSource, /ev\.id === 'scarab-queen-lair-dread-wind'[\s\S]*?playExpeditionSfx\?\.\('scarabQueenApproachAtmosphere'\)/);
});

test('environment interactions include reactive foreground and movement elements', () => {
  const interactions = extractExportedArray('ENVIRONMENT_INTERACTIONS');
  const platforms = extractExportedArray('PLATFORMS');

  [
    'breakable-crate',
    'loose-rocks',
    'hanging-rope',
    'swinging-banner',
    'collapsing-bridge',
    'watchtower-section',
    'rippling-water',
    'blowing-grass',
  ].forEach((type) => {
    assert.match(interactions, new RegExp(`type:\\s*'${type}'`));
  });
  assert.match(platforms, /reactive:\s*\{/);
  assert.match(platforms, /unstable platform/);
  assert.match(platforms, /collapsing bridge piece/);
  assert.match(platforms, /respawn:/);
});

test('ravine bridge uses structure cutouts over the continuous Desert Entry panel background', () => {
  assert.match(journeyComponentSource, /lost-bridge-structure-cutout-2026-06-08\.png/);
  assert.match(journeyComponentSource, /lost-bridge-ravine-drop-strip-clean-edge-2026-06-09\.png/);
  assert.match(journeyComponentSource, /lost-bridge-ravine-test-wide-2026-06-09\.png/);
  assert.match(journeyComponentSource, /lost-bridge-ravine-test-deep-2026-06-09\.png/);
  assert.match(journeyComponentSource, /lost-bridge-ravine-test-tall-wide-2026-06-09\.png/);
  assert.match(journeyComponentSource, /lost-bridge-ravine-temple-gap-option2-2026-06-10\.png/);
  assert.match(journeyComponentSource, /lost-bridge-ravine-depth-insert-option3-2026-06-10\.png/);
  assert.match(journeyComponentSource, /lost-bridge-ravine-under-bridge-insert-2026-06-10\.png/);
  assert.doesNotMatch(journeyComponentSource, /LOST_BRIDGE_RAVINE_FLOOR_BLEND_SRC = `\$\{LOST_BRIDGE_ASSET_DIR\}lost-bridge-ravine-drop-strip-2026-06-09\.png`/);
  assert.doesNotMatch(journeyComponentSource, /lost-bridge-ravine-backdrop-soft-2026-06-08\.png/);
  assert.match(journeyComponentSource, /LOST_BRIDGE_RAVINE_FLOOR_VARIANT_SRCS/);
  assert.match(journeyComponentSource, /LOST_BRIDGE_RAVINE_FLOOR_ASSET_KEYS/);
  assert.match(journeyComponentSource, /LOST_BRIDGE_RAVINE_NORMAL_IMAGE_PROP_KEYS = new Set\(\['lostBridgeRavineUnderBridgeInsert'\]\)/);
  assert.match(journeyComponentSource, /isLostBridgeRavineSpecialRendererProp/);
  assert.match(journeyComponentSource, /lostBridgeAssetsRef = useRef\(\{ images: \{\}, structure: null, floorBlend: null, floorBlends: \{\} \}\)/);
  assert.match(journeyComponentSource, /lostBridgeAssetsRef\.current\.floorBlend = floorBlend/);
  assert.match(journeyComponentSource, /lostBridgeAssetsRef\.current\.floorBlends\[assetKey\] = floorBlend/);
  assert.match(journeyComponentSource, /LOST_BRIDGE_ASSET_VERSION = 'lost-bridge-art-2026-06-10f'/);
  assert.match(journeyComponentSource, /LOST_BRIDGE_RAVINE_FLOOR_PROP_ID = 'desert-entry-lost-bridge-ravine-floor-1'/);
  assert.match(journeyComponentSource, /LOST_BRIDGE_OBSOLETE_RAVINE_FLOOR_PROP_IDS = new Set/);
  assert.match(journeyComponentSource, /pruneObsoleteLostBridgeRavineFloorEditorProps\(propPlacementEditorRef\.current\)/);
  assert.match(journeyComponentSource, /const getLostBridgeRavineFloorPlacement = useCallback/);
  assert.match(
    journeyComponentSource,
    /isLostBridgeRavineSpecialRendererProp\(prop\)[\s\S]*?!editor\.hiddenIds\.has\(prop\.id\)[\s\S]*?!Number\.isFinite\(prop\.alpha\) \|\| prop\.alpha > 0/,
    'retired ravine inserts with alpha 0 should not be drawn by the custom ravine renderer',
  );
  assert.match(journeyComponentSource, /ravineProps\.find\(item => item\.id === selectedId\) \|\| ravineProps\[ravineProps\.length - 1\]/);
  assert.match(journeyComponentSource, /const editorPlacement = getLostBridgeRavineFloorPlacement\(current\)/);
  assert.match(journeyComponentSource, /if \(!editorPlacement\) return false;/);
  assert.match(journeyComponentSource, /const deckBounds = getLostBridgeDeckBounds\(platforms \|\| \[\]\)/);
  assert.match(journeyComponentSource, /const bounds = deckBounds \|\|/);
  assert.match(journeyComponentSource, /activeRavineAssetKey/);
  assert.match(journeyComponentSource, /LOST_BRIDGE_RAVINE_FLOOR_VARIANT_SRCS\.lostBridgeRavineFloor/);
  assert.match(journeyComponentSource, /floorBlendAssetKey/);
  assert.match(journeyComponentSource, /deckBoundsFallback: !deckBounds/);
  assert.match(journeyComponentSource, /drawWorldLeft = editorPlacement\.drawWorldLeft/);
  assert.match(journeyComponentSource, /drawH = editorPlacement\.height/);
  assert.match(journeyComponentSource, /editorControlled: true/);
  assert.match(journeyComponentSource, /if \(isLostBridgeRavineSpecialRendererProp\(prop\)\) \{[\s\S]*?ctx\.restore\(\);[\s\S]*?return;/);
  assert.match(journeyComponentSource, /LOST_BRIDGE_RAVINE_BLEND_CLIP_TOP_OFFSET/);
  assert.match(journeyComponentSource, /ctx\.clip\(\)/);
  assert.match(journeyComponentSource, /ctx\.drawImage\(blend, drawX, drawY, drawW, drawH\)/);
  assert.match(journeyComponentSource, /LOST_BRIDGE_RAVINE_THROAT_TOP_OFFSET/);
  assert.match(journeyComponentSource, /lostBridgeRavineThroat/);
  assert.match(journeyComponentSource, /drawLostBridgeStructure\(ctx, renderablePlatforms, cameraX, current\)/);
  assert.match(
    journeyComponentSource,
    /nonBridgePlatforms\.forEach\(\(platform\) => drawPlatform\(ctx, platform, cameraX, current\)\);\s+if \(!chamberSceneActive\) drawLostBridgeRavineDepth\(ctx, renderablePlatforms, cameraX, current\);\s+bridgePlatforms\.forEach\(\(platform\) => drawPlatform\(ctx, platform, cameraX, current\)\);/,
    'ravine floor strip should render over ordinary floor/platforms, then bridge pieces should render back on top',
  );
  assert.match(journeyComponentSource, /layer:\s*'above-floor-below-bridge-platforms'/);
  assert.match(journeyComponentSource, /lostBridgeRavineStripBounds/);
  assert.match(journeyComponentSource, /LOST_BRIDGE_RAVINE_FOREGROUND_VOID_SIDE_PAD = 180/);
  assert.match(journeyComponentSource, /LOST_BRIDGE_RAVINE_FOREGROUND_VOID_MIN_TOP_OFFSET = 310/);
  assert.match(journeyComponentSource, /LOST_BRIDGE_RAVINE_FOREGROUND_VOID_GROUND_CLEARANCE = 8/);
  assert.match(journeyComponentSource, /const voidWorldLeft = bounds\.left - LOST_BRIDGE_RAVINE_FOREGROUND_VOID_SIDE_PAD/);
  assert.match(journeyComponentSource, /const voidWorldRight = bounds\.right \+ LOST_BRIDGE_RAVINE_FOREGROUND_VOID_SIDE_PAD/);
  assert.match(
    journeyComponentSource,
    /const top = Math\.max\([\s\S]*?bounds\.y \+ LOST_BRIDGE_RAVINE_FOREGROUND_VOID_MIN_TOP_OFFSET,[\s\S]*?GROUND_Y \+ LOST_BRIDGE_RAVINE_FOREGROUND_VOID_GROUND_CLEARANCE,[\s\S]*?\);/,
    'late ravine foreground void should stay below the walking lane instead of washing over Asha',
  );
  assert.doesNotMatch(journeyComponentSource, /const voidWorldLeft = bounds\.left - 520/);
  assert.doesNotMatch(journeyComponentSource, /bounds\.right \+ 720/);
  assert.doesNotMatch(journeyComponentSource, /ctx\.rect\(left - 80, top, width \+ 160/);
  assert.match(journeyComponentSource, /LOST_BRIDGE_STRUCTURE_DECK_IDS = new Set/);
  assert.match(journeyComponentSource, /LOST_BRIDGE_EDITOR_DECK_IDS = new Set/);
  assert.match(journeyComponentSource, /'desert-entry-platform-9'/);
  assert.match(journeyComponentSource, /LOST_BRIDGE_STRUCTURE_DECK_IDS\.has\(platform\.id\)/);
  assert.match(journeyComponentSource, /LOST_BRIDGE_EDITOR_DECK_IDS\.has\(platform\.id\)/);
  assert.match(journeyComponentSource, /\(platform\.zIndex \?\? 0\) > -50/);
  assert.match(journeyComponentSource, /isLostBridgeStructureDeckPlatform\(platform\)/);
  assert.match(journeyComponentSource, /Asha fell into the ravine\. Field rescue required\./);
  assert.match(journeyComponentSource, /The bridge drops into a ravine here\. Climb to the bridge deck before crossing\./);
  const editorDeckPlatform = journeyPlacementOverrides.platforms.find(entry => entry.id === 'desert-entry-platform-9');
  assert.equal(editorDeckPlatform?.y, 121, 'editor high bridge platform should now anchor the ravine crossing deck');
  assert.equal(editorDeckPlatform?.width, 1311);
  assert.equal(editorDeckPlatform?.invisible, true, 'high bridge deck should stay collision-only while art props carry the visual bridge');
  const mummificationThresholdWalkway = journeyPlacementOverrides.platforms.find(entry => entry.id === 'lost-bridge-mummification-threshold-walkway');
  assert.equal(mummificationThresholdWalkway?.x, 4750, 'visible threshold deck should stay supported after the bridge platform ends');
  assert.equal(mummificationThresholdWalkway?.y, 121);
  assert.equal(mummificationThresholdWalkway?.width, 770);
  assert.equal(mummificationThresholdWalkway?.height, 18);
  assert.equal(mummificationThresholdWalkway?.invisible, true);
  ['lost-bridge-near-landing', 'lost-bridge-slab-1', 'lost-bridge-slab-2'].forEach((id) => {
    assert.doesNotMatch(
      extractExportedArray('PLATFORMS'),
      new RegExp(`id:\\s*'${id}'[\\s\\S]*?y:\\s*JY\\(340\\)`),
      `${id} should not be a lower ravine-floor ledge`,
    );
    assert.match(
      extractExportedArray('PLATFORMS'),
      new RegExp(`id:\\s*'${id}'[\\s\\S]*?variant:\\s*'lost-bridge'`),
      `${id} should remain part of the playable bridge route`,
    );
    assert.ok(
      !journeyPlacementOverrides.deletedPlatformIds.includes(id),
      `${id} should stay active because the bridge is the only safe crossing`,
    );
  });
  assert.ok(
    existsSync(new URL('../../../public/assets/expedition/environment/egypt-opening/lost-bridge/lost-bridge-structure-cutout-2026-06-08.png', import.meta.url)),
    'cleaned bridge structure cutout should exist as a real project asset',
  );
  assert.ok(
    existsSync(new URL('../../../public/assets/expedition/environment/egypt-opening/lost-bridge/lost-bridge-ravine-drop-strip-clean-edge-2026-06-09.png', import.meta.url)),
    'cleaned bridge ravine drop strip should exist as a real project asset',
  );
  [
    'lost-bridge-ravine-test-wide-2026-06-09.png',
    'lost-bridge-ravine-test-deep-2026-06-09.png',
    'lost-bridge-ravine-test-tall-wide-2026-06-09.png',
    'lost-bridge-ravine-temple-gap-option2-2026-06-10.png',
    'lost-bridge-ravine-depth-insert-option3-2026-06-10.png',
    'lost-bridge-ravine-under-bridge-insert-2026-06-10.png',
    'lost-bridge-to-mummification-slope-blend-2026-06-11.png',
    'lost-bridge-mummification-dust-veil-2026-06-11.png',
  ].forEach((filename) => {
    assert.ok(
      existsSync(new URL(`../../../public/assets/expedition/environment/egypt-opening/lost-bridge/${filename}`, import.meta.url)),
      `${filename} should exist as a real ravine test asset`,
    );
  });
  assert.ok(
    journeyPlacementOverrides.deletedPropIds.includes('desert-entry-lost-bridge-ravine-floor-1'),
    'the original ravine strip should be replaced by the editor-tested ravine variants',
  );
  assert.equal(
    journeyPlacementOverrides.props.some(entry => entry.id === 'desert-entry-lost-bridge-ravine-floor-1-copy-1'),
    false,
    'duplicate clean-edge ravine floor copy should not stay as a stuck foreground layer',
  );
  assert.equal(
    journeyPlacementOverrides.props.some(entry => entry.id === 'desert-entry-lost-bridge-ravine-floor-1-copy-1-copy-1'),
    false,
    'second duplicate clean-edge ravine floor copy should not stay as a stuck foreground layer',
  );
  [
    'desert-entry-premium-pillar-caps-1',
    'desert-entry-broken-amphora-1',
    'desert-entry-old-baskets-1',
    'desert-entry-dried-reeds-2-copy-1-copy-1-copy-1',
    'lost-bridge-visual-left-ramp-ledge',
    'lost-bridge-visual-near-shelf',
    'lost-bridge-visual-near-span-slab',
    'desert-entry-bridge-carved-support-pier-1-copy-1-copy-1-copy-2',
  ].forEach((id) => {
    assert.equal(
      journeyPlacementOverrides.props.some(entry => entry.id === id),
      false,
      `${id} should stay removed from the cleaned bridge/ramp layout`,
    );
    assert.ok(journeyPlacementOverrides.deletedPropIds.includes(id), `${id} should be recorded as deleted`);
  });
  [
    'desert-entry-blocker-1',
    'desert-entry-blocker-2',
    'desert-entry-blocker-3',
    'desert-entry-blocker-4',
    'desert-entry-blocker-5',
    'desert-entry-blocker-6',
    'desert-entry-blocker-7',
    'desert-entry-blocker-8',
    'desert-entry-blocker-9',
    'desert-entry-blocker-10',
  ].forEach((id) => {
    assert.ok(
      journeyPlacementOverrides.deletedPlatformIds.includes(id),
      `${id} should stay deleted so the ravine does not rely on invisible lower-route blockers`,
    );
  });
  assert.equal(
    journeyPlacementOverrides.props.some(entry => entry.id === 'desert-entry-lost-bridge-ravine-floor-tall-wide-1'),
    false,
    'tall-wide ravine floor should stay removed from the cleaned bridge/ramp layout',
  );
  assert.ok(
    journeyPlacementOverrides.deletedPropIds.includes('desert-entry-lost-bridge-ravine-floor-tall-wide-1'),
    'tall-wide ravine floor should be recorded as deleted',
  );
  const activeRavineOption = journeyPlacementOverrides.props.find(entry => entry.id === 'desert-entry-lost-bridge-ravine-floor-deep-1');
  assert.equal(activeRavineOption, undefined, 'retired ravine depth overlay should stay removed from routed editor props');
  assert.ok(
    journeyPlacementOverrides.deletedPropIds.includes('desert-entry-lost-bridge-ravine-floor-deep-1'),
    'retired ravine depth overlay should stay recorded as deleted',
  );
  assert.match(journeyComponentSource, /Number\.isFinite\(prop\.alpha\) && prop\.alpha <= 0/);
  [
    ['desert-entry/desert-entry-opening-benchmark-no-platforms.png', 'clean opening background without the circled mid-ground ruin clutter'],
    ['desert-entry-opening-rebuild/desert-entry-arrival-ravine-mummification-panorama-approved-open-sky-2026-06-17.png', 'approved open-sky arrival-ravine-Mummification panorama'],
    ['desert-entry-opening-rebuild/desert-entry-clean-canyon-panorama-2026-06-18.png', 'clean canyon Desert Entry panorama'],
    ['desert-entry-opening-rebuild/desert-entry-ravine-bridge-depth-overlay-2026-06-11.png', 'ravine bridge depth overlay'],
  ].forEach(([filename, label]) => {
    assert.ok(
      existsSync(new URL(`../../../public/assets/expedition/backgrounds/${filename}`, import.meta.url)),
      `${label} should exist as a real opening rebuild background asset`,
    );
  });
  [
    'desert-entry-opening-rebuild/desert-entry-ravine-bridge-background-clean-2026-06-12.png',
    'desert-entry-opening-rebuild/desert-entry-ravine-to-mummification-background-raw-2026-06-11.png',
    'desert-entry-opening-rebuild/desert-entry-mummification-exterior-arrival-background-raw-2026-06-11.png',
    'desert-entry-regenerated/desert-entry-mummification-to-mural-background-raw-2026-06-11.png',
    'desert-entry-regenerated/desert-entry-mural-to-scribe-background-raw-2026-06-11.png',
    'desert-entry-regenerated/desert-entry-scribe-to-queen-background-raw-2026-06-11.png',
    'desert-entry-regenerated/desert-entry-queen-to-ruined-gateway-background-raw-2026-06-11.png',
  ].forEach((filename) => {
    assert.equal(
      existsSync(new URL(`../../../public/assets/expedition/backgrounds/${filename}`, import.meta.url)),
      false,
      `${filename} should be deleted so obsolete ruin background plates cannot return`,
    );
  });
  assert.match(journeyComponentSource, /DESERT_ENTRY_PRIMARY_BACKGROUND_PLATE_IDS = Object\.freeze/);
  assert.match(journeyComponentSource, /DESERT_ENTRY_PRIMARY_BACKGROUND_PLATE_SEAM_MASKS = Object\.freeze/);
  assert.match(useJourneyRendererSource, /drawDesertJourneyScenePanelsFrame/);
  assert.match(useJourneyRendererSource, /drawDesertJourneySceneMasksFrame/);
  assert.match(useJourneyRendererSource, /drawDesertEntryPrimaryBackgroundPlatesFrame/);
  assert.match(useJourneyRendererSource, /drawDesertJourneyPanelLayerFrame/);
  assert.match(useJourneyRendererSource, /drawDesertJourneyTransitionMaskFrame/);
  assert.match(useJourneyRendererSource, /DESERT_JOURNEY_BACKGROUND_SYSTEM_VERSION/);
  assert.match(useJourneyRendererSource, /desertJourneyBackgroundSystemVersion/);
  assert.match(useJourneyRendererSource, /desertEntryPrimaryBackgroundPlateIds/);
  assert.match(useJourneyRendererSource, /desertEntryPrimaryBackgroundPlateSeamMasks/);
  assert.match(useJourneyRendererSource, /single-plate-camera-pan-primary-png-v3/);
  assert.doesNotMatch(journeyComponentSource, /full-canvas-route-crossfade-primary-png-v2/);
  assert.match(useJourneyRendererSource, /isDesertEntryRebuildBackgroundPlateProp/);
  assert.doesNotMatch(journeyComponentSource, /full-canvas-route-crossfade-background-v1/);
  assert.doesNotMatch(journeyComponentSource, /desert-entry-rebuild-full-canvas-route-crossfade-background-v1/);
  [
    'desert-entry-lost-bridge-mummification-transition-apron-1',
    'desert-entry-bridge-mummification-dust-veil-1',
    'desert-entry-bridge-mummification-span-left-1',
    'desert-entry-bridge-mummification-span-right-1',
    'desert-entry-bridge-mummification-broken-left-cap-1',
    'desert-entry-bridge-mummification-slope-fill-1',
    'desert-entry-bridge-mummification-threshold-shelf-1',
    'desert-entry-bridge-mummification-seam-support-pier-1',
  ].forEach((id) => {
    const piece = journeyPlacementOverrides.props.find(entry => entry.id === id);
    assert.equal(piece, undefined, `${id} should be deleted with the obsolete bridge-to-Mummification ruin cluster`);
    assert.ok(journeyPlacementOverrides.deletedPropIds.includes(id), `${id} should stay recorded as deleted`);
  });
  assert.equal(
    journeyPlacementOverrides.props.some(entry => entry.id === 'lost-bridge-visual-rubble-ramp-climb'),
    false,
    'old rubble ramp climb prop should stay removed from the active bridge layout',
  );
  assert.ok(
    journeyPlacementOverrides.deletedPropIds.includes('lost-bridge-visual-rubble-ramp-climb'),
    'old rubble ramp climb prop should be recorded as deleted',
  );
  assert.ok(
    existsSync(new URL('../../../public/assets/expedition/environment/egypt-opening/lost-bridge/lost-bridge-rubble-ramp-climb-2026-06-09.png', import.meta.url)),
    'rubble ramp climb asset should exist as a real project PNG',
  );
});

test('Desert Journey panel background avoids procedural ruins behind the primary PNG panorama', () => {
  const panelLayerStart = useJourneyRendererSource.indexOf('export function drawDesertJourneyPanelLayerFrame');
  const transitionMaskStart = useJourneyRendererSource.indexOf('export function drawDesertJourneyTransitionMaskFrame', panelLayerStart);
  assert.notEqual(panelLayerStart, -1);
  assert.notEqual(transitionMaskStart, -1);
  const panelLayerSource = useJourneyRendererSource.slice(panelLayerStart, transitionMaskStart);

  assert.match(journeyComponentSource, /DESERT_ENTRY_RETIRED_BACKGROUND_PROP_IDS = new Set/);
  assert.match(journeyComponentSource, /isRetiredDesertEntryBackgroundProp\(prop\)[\s\S]*return null/);
  assert.match(journeyComponentSource, /pruneRetiredDesertEntryBackgroundEditorProps\(propPlacementEditorRef\.current\)/);
  assert.match(
    journeyComponentSource,
    /const desertEntryPrimaryBackgroundPlatesDrawn = canDrawCleanDesertEntryBackground[\s\S]*drawDesertEntryPrimaryBackgroundPlates/,
    'clean primary panorama plates should be attempted before old procedural panel fallback',
  );
  assert.match(
    journeyComponentSource,
    /const desertJourneyScenePanelsDrawn = canDrawCleanDesertEntryBackground[\s\S]*!desertEntryPrimaryBackgroundPlatesDrawn[\s\S]*drawDesertJourneyScenePanels/,
    'old Desert Entry scene panels should only be a fallback when the clean primary panorama is unavailable',
  );
  assert.match(panelLayerSource, /layer\.role === 'mid'/);
  assert.match(panelLayerSource, /drawDuneBand\(448/);
  assert.doesNotMatch(
    panelLayerSource,
    /drawStoneBlock|drawBrokenColumn|drawArch/,
    'background panel layers should not draw reachable-looking ruin blocks, columns, or arches behind the primary panorama',
  );
});

test('platform polish creates purposeful jump challenges with checkpoint rescue hooks', () => {
  const platforms = extractExportedArray('PLATFORMS');
  const upgrades = extractExportedArray('UPGRADES');
  const hazards = extractExportedArray('HAZARDS');

  [
    'temple-sandfall-climb',
    'catacomb-torch-climb',
    'final-site-permit-climb',
  ].forEach((challengeId) => {
    assert.match(platforms, new RegExp(`challengeId:\\s*'${challengeId}'|challengeComplete:\\s*'${challengeId}'`));
  });

  [
    'collapsing column step',
    'sandfall recovery shelf',
    'archive reward step',
    'torch safe ledge',
    'bat dodge perch',
    'survey rope ledge',
  ].forEach((label) => {
    assert.match(platforms, new RegExp(label));
  });
  [
    'post-pyramid-guardian-prep-route',
    'post-pyramid survey plinth',
    'field kit stepping stone',
    'guardian prep cracked ledge',
    'guardian prep safe marker',
  ].forEach((removedPlatform) => {
    assert.doesNotMatch(platforms, new RegExp(removedPlatform));
  });

  assert.match(platforms, /challengeFailMessage:/);
  assert.match(journeyComponentSource, /current\.activePlatformChallenge/);
  assert.match(journeyComponentSource, /triggerJourneyRescue\('Missed platform jump\. Field rescue required\.'/);

  assert.match(hazards, /id:\s*'entry-pressure-plate'[\s\S]*?width:\s*126[\s\S]*?penalty:\s*\{\s*stamina:\s*8,\s*time:\s*3\s*\}/);
  assert.match(hazards, /id:\s*'entry-cracked-floor-trap'[\s\S]*?penalty:\s*\{\s*stamina:\s*9\s*\}/);
  assert.match(hazards, /id:\s*'sand-pit'[\s\S]*?width:\s*132[\s\S]*?penalty:\s*\{\s*time:\s*9\s*\}/);
  assert.match(hazards, /Jump cleanly over them/);
  assert.match(hazards, /A wall dart snapped from a hidden launcher/);
  assert.match(journeyRenderAssetsSource, /'entry-pressure-plate':\s*'groundCracked'/);
  assert.match(journeyRenderAssetsSource, /'entry-cracked-floor-trap':\s*'groundCracked'/);
  assert.match(journeyComponentSource, /'entry-pressure-plate':\s*\{[\s\S]*?warning:\s*'ground'/);
  assert.match(journeyComponentSource, /'entry-cracked-floor-trap':\s*\{[\s\S]*?warning:\s*'ground'/);
  assert.doesNotMatch(journeyComponentSource, /visualHazardId === 'entry-pressure-plate'[\s\S]*?ctx\.roundRect/);
  assert.doesNotMatch(journeyComponentSource, /visualHazardId === 'entry-cracked-floor-trap'[\s\S]*?ctx\.strokeRect/);
  assert.doesNotMatch(journeyComponentSource, /hazard\.id === 'sand-pit'[\s\S]*?ctx\.arc/);
  assert.match(useJourneyRendererSource, /export function drawEnemyAttackTellFrame\(ctx, enemy/);
  assert.match(journeyComponentSource, /attackTellActive/);
  assert.match(journeyComponentSource, /recoveryWindowActive/);
  assert.match(useJourneyRendererSource, /export function drawAttackArcFrame\(\) \{\}/);

  assert.match(upgrades, /id:\s*'basecamp-upgrade-voucher'[\s\S]*?x:\s*X\(925\)[\s\S]*?y:\s*JY\(320\)/);
  assert.match(upgrades, /id:\s*'reinforced-boots'[\s\S]*?x:\s*X\(1310\)[\s\S]*?y:\s*JY\(270\)/);
  assert.match(upgrades, /id:\s*'rope-launcher'[\s\S]*?x:\s*X\(2935\)[\s\S]*?y:\s*JY\(210\)/);
  assert.match(upgrades, /id:\s*'torch-upgrade'[\s\S]*?x:\s*X\(4405\)[\s\S]*?y:\s*JY\(252\)/);
  assert.match(upgrades, /id:\s*'ancient-compass'[\s\S]*?x:\s*X\(7905\)[\s\S]*?y:\s*JY\(220\)/);
});

test('Egypt hazard traps use painted decal assets with ground-aligned placement', () => {
  const hazards = extractExportedArray('HAZARDS');
  const hazardPurposes = source.slice(source.indexOf('export const HAZARD_PURPOSES = {'), source.indexOf('export const ENEMIES = ['));
  const hazardIds = [...hazards.matchAll(/id:\s*'([^']+)'/g)].map(match => match[1]);

  assert.ok(existsSync(egyptOpeningTrapDecalsPath), 'opening trap decal sheet should exist');
  assert.ok(existsSync(egyptOpeningHazardDecalsPath), 'opening hazard decal sheet should exist');
  assert.match(journeyComponentSource, /OPENING_TRAP_DECAL_PACK_SRC/);
  assert.match(journeyComponentSource, /OPENING_HAZARD_DECAL_PACK_SRC/);
  assert.match(journeyComponentSource, /painted-egypt-trap-decals-complete/);
  assert.match(journeyComponentSource, /getEgyptHazardDecalDest\(hazard,\s*hx,\s*footY,\s*decalDescriptor\.regionKey\)/);

  hazardIds.forEach((id) => {
    assert.match(
      hazardPurposes,
      new RegExp(`'${id}'`),
      `${id} should have a defined in-game trap purpose`,
    );
    assert.match(
      journeyComponentSource,
      new RegExp(`'${id}':\\s*'[^']+'`),
      `${id} should map to a painted Egypt hazard decal`,
    );
  });

  [
    'spikeTrap',
    'pressurePlate',
    'crackedFloor',
    'scarabSealTrap',
    'glyphTripwire',
    'fallingStoneWarning',
    'softSandPit',
    'thornScrub',
    'darkGap',
    'batCloud',
    'dustWave',
    'looseSlope',
    'surveyRope',
    'warningRubble',
  ].forEach((regionKey) => {
    assert.match(journeyComponentSource, new RegExp(`${regionKey}:\\s*\\{[\\s\\S]*?height:`));
  });

  assert.match(hazardPurposes, /buried-spike-floor[\s\S]*?teaches jump timing/);
  assert.match(hazardPurposes, /pressure-and-seal-trigger[\s\S]*?testing entry/);
  assert.match(hazardPurposes, /unstable-floor[\s\S]*?cracked temple floors/);
  assert.match(hazardPurposes, /survey-site-obstacles[\s\S]*?expedition activity becoming a hazard/);
  assert.match(journeyComponentSource, /'temple-loose-step':\s*'crackedFloor'/);
  assert.match(journeyComponentSource, /'temple-floor-crack':\s*'crackedFloor'/);
  assert.match(journeyComponentSource, /'escape-cracked-step':\s*'entry-cracked-floor-trap'/);
  assert.match(journeyComponentSource, /'camp-low-rope':\s*'survey-rope'/);
  assert.match(journeyComponentSource, /'dig-site-loose-rope':\s*'survey-rope'/);
  assert.match(journeyComponentSource, /'rolling-stones':\s*'warningRubble'/);
  assert.match(journeyComponentSource, /'sandfall-collapsing-stones':\s*'warningRubble'/);
  assert.match(journeyRenderAssetsSource, /'temple-loose-step':\s*'groundCracked'/);
  assert.match(journeyRenderAssetsSource, /'temple-floor-crack':\s*'groundCracked'/);
  assert.match(journeyRenderAssetsSource, /'escape-cracked-step':\s*'groundCracked'/);
  assert.match(journeyRenderAssetsSource, /'camp-low-rope':\s*'rope'/);
  assert.match(journeyRenderAssetsSource, /'dig-site-loose-rope':\s*'rope'/);
  assert.doesNotMatch(journeyRenderAssetsSource, /'temple-loose-step':\s*'spikeTrap'/);
  assert.doesNotMatch(journeyRenderAssetsSource, /'temple-floor-crack':\s*'spikeTrap'/);
});

test('dynamic world events add mystery and atmosphere without new level systems', () => {
  const events = extractExportedArray('ENVIRONMENT_EVENTS');
  const landmarks = extractExportedArray('WORLD_CONTINUITY_LANDMARKS');
  const storyProps = extractExportedArray('STORY_PROPS');

  [
    'rockfall',
    'dust-gust',
    'birds-scatter',
    'moving-fog',
    'ruin-collapse',
    'shrine-glow',
    'unstable-excavation',
  ].forEach((type) => {
    assert.match(events, new RegExp(`type:\\s*'${type}'`));
  });
  assert.match(events, /dynamic:\s*true/);
  assert.match(events, /card:\s*false/);
  assert.match(events, /Ancient Shrine Discovered/);

  assert.match(landmarks, /hidden-watchtower-route/);
  assert.match(landmarks, /type:\s*'shrine'/);
  assert.match(landmarks, /type:\s*'blocked-tunnel'/);

  [
    'generated premium pillar-cap ruins in open sand after the pyramid',
    'collapsed tower remains',
    'old field journal cache',
    'sealed blocked tunnel',
    'destroyed bridge remains',
    'broken excavation tools',
  ].forEach((label) => {
    assert.match(storyProps, new RegExp(label));
  });
});

test('Discovery Entrance upgrades the final Journey handoff without replacing Base Camp', () => {
  const events = extractExportedArray('ENVIRONMENT_EVENTS');
  const storyProps = extractExportedArray('STORY_PROPS');

  assert.match(source, /export const DISCOVERY_ENTRANCE = \{/);
  assert.match(source, /Discovery Entrance Found/);
  assert.match(source, /You have located a sealed archaeological site\./);
  assert.match(source, /Return to Base Camp Outpost to prepare the excavation\./);
  assert.match(events, /id:\s*'discovery-entrance-reveal'/);
  assert.match(events, /type:\s*'shrine-glow'/);
  assert.match(storyProps, /sealed entrance torch lamp/);
  assert.match(storyProps, /buried stairway marker/);

  assert.match(journeyComponentSource, /DISCOVERY_ENTRANCE_REVEAL_SECONDS/);
  assert.match(journeyComponentSource, /drawDiscoveryEntrance/);
  assert.match(journeyComponentSource, /discoveryEntranceActive/);
  assert.match(journeyComponentSource, /onComplete\?\.\(\[\.\.\.current\.fieldKit\]\)/);
});

test('dynamic world events use a project-bound painted asset sheet', () => {
  assert.match(DYNAMIC_WORLD_EFFECTS_VERSION, /painted-dynamic-world-effects/);
  assert.match(DYNAMIC_WORLD_EFFECTS_SRC, /assets\/expedition\/environment\/dynamic-world\/egypt-dynamic-world-effects\.png/);
  ['dustGust', 'birdsScatter', 'shrineGlow', 'rockfall'].forEach((key) => {
    assert.ok(DYNAMIC_WORLD_EFFECT_REGIONS[key], `${key} region should be mapped`);
    assert.ok(DYNAMIC_WORLD_EFFECT_REGIONS[key].w > 0);
    assert.ok(DYNAMIC_WORLD_EFFECT_REGIONS[key].h > 0);
  });
  assert.ok(
    existsSync(new URL('../../../public/assets/expedition/environment/dynamic-world/egypt-dynamic-world-effects.png', import.meta.url)),
    'painted dynamic world asset should exist in public assets',
  );
});

test('Egypt atmosphere prop pack is registered and drawn through existing story props', () => {
  const storyProps = extractExportedArray('STORY_PROPS');

  assert.equal(egyptAtmosphereAtlas.image, 'egypt-atmosphere-pack.png');
  assert.match(egyptAtmosphereAtlas.source, /Premium image-generated Lost Site Expedition prop pack integrated 2026-06-01/);
  [
    'supplyJars',
    'fieldChest',
    'scrollCache',
    'torchStand',
    'rubbleScatter',
    'brokenPillarTall',
    'ankhSealPanel',
  ].forEach((key) => {
    assert.ok(egyptAtmosphereAtlas.regions[key], `${key} should exist in the atmosphere atlas`);
    assert.match(journeyRenderAssetsSource, new RegExp(`'${key}'`));
    assert.match(storyProps, new RegExp(`atmosphereAssetKey:\\s*'${key}'`));
  });
  [
    'desertEntryPremiumFallenColumn',
    'desertEntryPremiumPillarCaps',
    'desertEntryPremiumFieldChest',
    'desertEntryPremiumStorageJars',
    'desertEntryPremiumThresholdSlab',
  ].forEach((key) => {
    assert.ok(egyptAtmosphereAtlas.regions[key], `${key} should exist in the generated premium prop atlas`);
    assert.match(journeyRenderAssetsSource, new RegExp(`'${key}'`));
  });
  [
    'desertEntryPremiumFallenColumn',
    'desertEntryPremiumPillarCaps',
    'desertEntryPremiumThresholdSlab',
  ].forEach((key) => {
    assert.match(storyProps, new RegExp(`atmosphereAssetKey:\\s*'${key}'`));
  });
  assert.ok(egyptAtmosphereAtlas.regions.coinPile, 'coinPile remains available in the atlas but should not be used in the curated Journey layout');
  assert.match(journeyRenderAssetsSource, /'coinPile'/);
  assert.doesNotMatch(storyProps, /atmosphereAssetKey:\s*'coinPile'/);

  assert.ok(
    existsSync(new URL('../../../public/assets/expedition/environment/egypt-atmosphere/egypt-atmosphere-pack.png', import.meta.url)),
    'curated atmosphere atlas image should exist in public assets',
  );
  assert.match(journeyRenderAssetsSource, /EGYPT_ATMOSPHERE:\s*'egypt-atmosphere'/);
  assert.match(journeyRenderAssetsSource, /EGYPT_ATMOSPHERE_ASSET_VERSION = 'opening-pyramid-split-props-2026-06-05'/);
  assert.match(journeyRenderAssetsSource, /versionQuery = packConfig\.version \? `\?v=\$\{encodeURIComponent\(packConfig\.version\)\}` : ''/);
  assert.match(journeyRenderAssetsSource, /image\.src = `\$\{baseUrl\}\$\{packConfig\.basePath\}\$\{atlas\.image\}\$\{versionQuery\}`/);
  assert.match(journeyComponentSource, /atmosphereEnvironmentAssetsRef/);
  assert.match(journeyComponentSource, /packId:\s*ENVIRONMENT_ASSET_PACK_IDS\.EGYPT_ATMOSPHERE/);
  assert.match(journeyComponentSource, /atmospherePropCount/);
  assert.match(journeyComponentSource, /propForAsset\.atmosphereAssetKey/);
  assert.doesNotMatch(journeyComponentSource, /new Atmosphere|class Atmosphere|createAtmosphereSystem/);
});

test('Lost Site Expedition prop asset pack has editor registry entries, PNGs, and atlas regions', () => {
  assert.equal(lostSitePropRegistry.length, 107);
  const registryIds = new Set(lostSitePropRegistry.map(entry => entry.id));
  assert.equal(registryIds.has('standingPillar'), false, 'removed weak standing column should not be available in the prop editor');
  assert.equal(registryIds.has('stoneDoorFrame'), false, 'removed weak temple arch should not be available in the prop editor');
  assert.ok(registryIds.has('routeGateFront'), 'route gate front should be available in the prop editor');
  assert.ok(registryIds.has('routeGateBack'), 'route gate back should be available in the prop editor');
  assert.ok(registryIds.has('ledgeHelperCarvedMasonryClimb'), 'carved masonry ledge helper should be available in the prop editor');
  assert.ok(registryIds.has('ledgeHelperExcavationAssistKit'), 'excavation assist ledge helper should be available in the prop editor');
  assert.ok(registryIds.has('ledgeHelperBlendedRuinLedge'), 'blended ruin ledge helper should be available in the prop editor');
  assert.ok(registryIds.has('ledgeHelperFallenColumnSteps'), 'fallen column ledge helper should be available in the prop editor');
  assert.ok(registryIds.has('ledgeHelperRopeLadderScaffold'), 'rope ladder ledge helper should be available in the prop editor');
  assert.ok(registryIds.has('ledgeHelperBuriedRampBlocks'), 'buried ramp ledge helper should be available in the prop editor');
  assert.equal(registryIds.has('openingPyramidClimbPack'), false, 'full opening pyramid sheet should not be exposed as one editor prop');
  const editorPalette = createJourneyPropPalette([], lostSitePropRegistry);
  const ravineFloorPaletteItem = editorPalette.find(item => item.imageAssetKey === 'lostBridgeRavineFloor');
  assert.equal(ravineFloorPaletteItem?.category, 'Ravine Bridge');
  assert.equal(ravineFloorPaletteItem?.template?.type, 'image-prop');
  assert.equal(ravineFloorPaletteItem?.template?.depth, 'background');
  assert.equal(ravineFloorPaletteItem?.template?.assetPath, 'assets/expedition/environment/egypt-opening/lost-bridge/lost-bridge-ravine-drop-strip-clean-edge-2026-06-09.png');
  assert.equal(ravineFloorPaletteItem?.template?.width, 1080);
  assert.equal(ravineFloorPaletteItem?.template?.height, 251);
  [
    ['lostBridgeRavineFloorWide', 'Lost Bridge Ravine Floor - Wide', 'lost-bridge-ravine-test-wide-2026-06-09.png', 1700, 366],
    ['lostBridgeRavineFloorDeep', 'Lost Bridge Ravine Floor - Deep', 'lost-bridge-ravine-test-deep-2026-06-09.png', 1530, 535],
    ['lostBridgeRavineFloorTallWide', 'Lost Bridge Ravine Floor - Tall Wide', 'lost-bridge-ravine-test-tall-wide-2026-06-09.png', 1900, 556],
    ['lostBridgeRavineTempleGapOption2', 'Lost Bridge Ravine - Temple Gap (Option 2)', 'lost-bridge-ravine-temple-gap-option2-2026-06-10.png', 1774, 887],
    ['lostBridgeRavineDepthInsertOption3', 'Lost Bridge Ravine - Depth Insert (Option 3)', 'lost-bridge-ravine-depth-insert-option3-2026-06-10.png', 1774, 887, 'background'],
    ['lostBridgeRavineUnderBridgeInsert', 'Lost Bridge Ravine - Under Bridge Insert', 'lost-bridge-ravine-under-bridge-insert-2026-06-10.png', 1700, 638, 'midground'],
    ['lostBridgeMummificationSlopeBlend', 'Lost Bridge To Mummification Slope Blend', 'lost-bridge-to-mummification-slope-blend-2026-06-11.png', 600, 320, 'background'],
    ['lostBridgeMummificationDustVeil', 'Lost Bridge To Mummification Dust Veil', 'lost-bridge-mummification-dust-veil-2026-06-11.png', 520, 630, 'midground'],
  ].forEach(([imageAssetKey, displayName, filename, width, height, depth = 'background']) => {
    const item = editorPalette.find(entry => entry.imageAssetKey === imageAssetKey);
    assert.equal(item?.label, displayName);
    assert.equal(item?.category, 'Ravine Bridge');
    assert.equal(item?.template?.type, 'image-prop');
    assert.equal(item?.template?.depth, depth);
    assert.equal(item?.template?.assetPath, `assets/expedition/environment/egypt-opening/lost-bridge/${filename}`);
    assert.equal(item?.template?.width, width);
    assert.equal(item?.template?.height, height);
  });
  const rubbleRampPaletteItem = editorPalette.find(item => item.imageAssetKey === 'bridgeRubbleRampClimb');
  assert.equal(rubbleRampPaletteItem?.label, 'Bridge Rubble Ramp Climb');
  assert.equal(rubbleRampPaletteItem?.category, 'Bridge Kit');
  assert.equal(rubbleRampPaletteItem?.template?.type, 'image-prop');
  assert.equal(rubbleRampPaletteItem?.template?.depth, 'route-edge');
  assert.equal(rubbleRampPaletteItem?.template?.assetPath, 'assets/expedition/environment/egypt-opening/lost-bridge/lost-bridge-rubble-ramp-climb-2026-06-09.png');
  assert.equal(rubbleRampPaletteItem?.template?.width, 1774);
  assert.equal(rubbleRampPaletteItem?.template?.height, 887);
  [
    'propEdgeLongRubble',
    'propEdgeBuriedBlocks',
    'propEdgeSoftSandMound',
    'propEdgeCarvedWallBase',
    'bridgeCarvedSupportPier',
    'bridgeLeftBrokenPier',
    'bridgeRightBrokenPier',
    'bridgeCrackedSpanSlab',
    'bridgeBrokenEndCap',
    'bridgeCarvedStepLedge',
    'bridgeBuriedRampLedge',
    'bridgeNarrowCrackedShelf',
    'bridgeFootholdStoneCluster',
    'bridgeRubbleRampClimb',
    'lostBridgeRavineFloor',
    'lostBridgeRavineFloorWide',
    'lostBridgeRavineFloorDeep',
    'lostBridgeRavineFloorTallWide',
    'lostBridgeRavineTempleGapOption2',
    'lostBridgeRavineDepthInsertOption3',
    'lostBridgeRavineUnderBridgeInsert',
    'lostBridgeMummificationSlopeBlend',
    'lostBridgeMummificationDustVeil',
  ].forEach(id => assert.ok(registryIds.has(id), `${id} should be available in the prop editor`));
  [
    'openingPyramidLeftStairFace',
    'openingPyramidRightStairFace',
    'openingPyramidTerraceWall',
    'openingPyramidTrapSlab',
    'openingPyramidCrackedBlock',
    'openingPyramidCarvedColumn',
    'openingPyramidPaintedColumn',
    'openingPyramidPedestal',
    'openingPyramidSeal',
    'openingPyramidRubble',
    'openingPyramidDust',
  ].forEach(id => assert.ok(registryIds.has(id), `${id} should be available in the prop editor`));
  lostSitePropRegistry
    .filter(entry => entry.category === 'Ledge Helpers')
    .forEach((entry) => {
      assert.equal(entry.defaultColorGradeFilter, 'none', `${entry.id} should keep its source PNG colour grade`);
    });

  const categories = new Set(lostSitePropRegistry.map(entry => entry.category));
  [
    'Tomb Architecture',
    'Route Gate Architecture',
    'Archaeology Props',
    'Egyptian Sacred Props',
    'Environmental Storytelling Props',
    'Premium Floor Kit',
    'Ledge Helpers',
    'Arrival Threshold',
    'Prop Edge Kit',
    'Bridge Kit',
    'Ravine Bridge',
  ].forEach(category => assert.ok(categories.has(category), `${category} should be represented`));

  const premiumFloorKitIds = new Set([
    'loose_floor_tiles',
    'cracked_floor_tile',
    'pressure_plate',
    'suspicious_sand_patch',
    'scarab_carving',
  ]);
  const standaloneImageEntries = new Map([
    ['routeGateFront', {
      assetPath: 'assets/expedition/environment/egypt-opening/route-gate-front.png',
      defaultType: 'route-gate-prop',
    }],
    ['routeGateBack', {
      assetPath: 'assets/expedition/environment/egypt-opening/route-gate-back.png',
      defaultType: 'route-gate-prop',
    }],
  ]);

  lostSitePropRegistry.forEach((entry) => {
    assert.ok(entry.id, 'registry entry should have an id');
    assert.ok(entry.displayName, `${entry.id} should have a display name`);
    if (entry.category === 'Arrival Threshold' || entry.category === 'Desert Atmosphere' || entry.category === 'Prop Edge Kit' || entry.category === 'Bridge Kit' || entry.category === 'Ravine Bridge') {
      assert.equal(entry.defaultScale, 1);
      assert.equal(entry.collidable, false);
      if (entry.category === 'Ravine Bridge') {
        assert.ok(typeof entry.defaultColorGradeFilter === 'string');
      } else {
        assert.equal(entry.defaultColorGradeFilter, 'none');
      }
      const bridgeLostBridgeAsset = entry.category === 'Bridge Kit'
        && entry.assetPath.startsWith('assets/expedition/environment/egypt-opening/lost-bridge/');
      const categoryFolder = entry.category === 'Arrival Threshold'
        ? 'arrival-threshold'
        : entry.category === 'Prop Edge Kit' || entry.category === 'Bridge Kit'
          ? 'edge-kit'
          : entry.category === 'Ravine Bridge'
            ? 'lost-bridge'
          : 'desert-entry';
      const categoryPathRoot = entry.category === 'Ravine Bridge'
        ? 'assets/expedition/environment/egypt-opening'
        : 'assets/expedition/environment/egypt-atmosphere/props';
      if (!bridgeLostBridgeAsset) {
        assert.match(entry.assetPath, new RegExp(`^${categoryPathRoot}/${categoryFolder}/.+\\.png$`));
      }
      if (entry.category === 'Prop Edge Kit' || entry.category === 'Bridge Kit' || entry.category === 'Ravine Bridge') {
        assert.equal(entry.defaultType, 'image-prop');
        assert.equal(entry.imageAssetKey, entry.id);
      }
      if (entry.category === 'Prop Edge Kit') assert.equal(entry.defaultDepth, 'route-edge');
      if (entry.category === 'Bridge Kit') assert.ok(['midground', 'route-edge'].includes(entry.defaultDepth));
      if (entry.category === 'Ravine Bridge') {
        assert.ok(['background', 'midground'].includes(entry.defaultDepth));
        assert.ok(['background', 'midground'].includes(entry.defaultLayer));
        assert.ok(entry.defaultAlpha > 0 && entry.defaultAlpha <= 1);
      }
      assert.ok(
        existsSync(new URL(`../../../public/${entry.assetPath}`, import.meta.url)),
        `${entry.assetPath} should exist as an individual transparent PNG`,
      );
      return;
    }
    assert.equal(entry.defaultScale, 1);
    assert.equal(entry.defaultLayer, premiumFloorKitIds.has(entry.id) ? 'route-edge' : 'foreground');
    assert.equal(entry.collidable, false);
    assert.equal(entry.inspectable, false);
    if (standaloneImageEntries.has(entry.id)) {
      const standaloneEntry = standaloneImageEntries.get(entry.id);
      assert.equal(entry.defaultType, standaloneEntry.defaultType);
      assert.equal(entry.imageAssetKey, entry.id);
      assert.equal(entry.assetPath, standaloneEntry.assetPath);
      assert.ok(
        existsSync(new URL(`../../../public/${entry.assetPath}`, import.meta.url)),
        `${entry.assetPath} should exist as an individual transparent PNG`,
      );
      return;
    }
    assert.match(entry.assetPath, /^assets\/expedition\/environment\/egypt-atmosphere\/props\/lost-site-expedition\/.+\.png$/);
    assert.ok(egyptAtmosphereAtlas.regions[entry.id], `${entry.id} should have an atmosphere atlas region`);
    assert.equal(egyptAtmosphereAtlas.regions[entry.id].assetPath, entry.assetPath);
    assert.ok(
      existsSync(new URL(`../../../public/${entry.assetPath}`, import.meta.url)),
      `${entry.assetPath} should exist as an individual transparent PNG`,
    );
    assert.match(journeyRenderAssetsSource, new RegExp(`'${entry.id}'`));
  });

  assert.match(journeyComponentSource, /lostSitePropRegistry/);
  assert.match(journeyComponentSource, /createJourneyPropPalette\(STORY_PROPS,\s*lostSitePropRegistry\)/);
  assert.match(journeyComponentSource, /selectedPaletteCategory === 'ledge'[\s\S]*?category === 'Ledge Helpers'/);
  assert.match(journeyComponentSource, /\['ledge', 'Ledges'\]/);
  assert.match(journeyComponentSource, /propForAsset\.imageAssetKey === 'routeGateFront'/);
  assert.match(journeyComponentSource, /propForAsset\.imageAssetKey === 'openingPyramidClimbPack'/);
  assert.match(journeyComponentSource, /ROUTE_GATE_STANDALONE_PROP_COLOR_GRADE_FILTER/);
  assert.match(journeyComponentSource, /PROP_EDITOR_DEPTH_OPTIONS = \['background', 'midground', 'grounded', 'route-edge', 'foreground-occluder'\]/);
  assert.match(journeyComponentSource, /drawPlayerSprite\(ctx, player\.x - cameraX[\s\S]*?drawForegroundOccluderProps\(ctx, current, cameraX, now\)/);
  assert.match(useJourneyRendererSource, /drawForegroundOccluderPropsFrame[\s\S]*?drawStoryPropFrame\(ctx, prop, cameraX, now, 'foreground-occluder'/);
  assert.match(journeyComponentSource, /drawStandalonePropAsset/);
  assert.match(journeyComponentSource, /ctx\.scale\(\(propForAsset\.mirrorX \? -1 : 1\) \* horizontalSquash,\s*propForAsset\.mirrorY \? -1 : 1\)/);
  assert.match(journeyComponentSource, /const drawn = drawTransformedPropAsset\(\)/);
});

test('Egypt atmosphere layout fills each Journey section without changing gameplay systems', () => {
  const storyProps = extractExportedArray('STORY_PROPS');

  [
    'desert-entry',
    'ruined-temple',
    'catacombs',
    'escape-sequence',
    'dig-site-entrance',
  ].forEach((sectionId) => {
    assert.match(
      storyProps,
      new RegExp(`sectionId:\\s*'${sectionId}'[\\s\\S]*?type:\\s*'atmosphere-prop'`),
      `${sectionId} should include decorative atmosphere props`,
    );
  });

  [
    'desert-entry-premium-threshold-slab-1',
    'desert-entry-premium-column-1',
    'desert-entry-premium-pillar-caps-1',
    'atmosphere-temple-fallen-stone',
    'ruined-temple-fallen-column-1',
    'catacomb-warning-urns-1',
    'escape-cracked-pillar-1',
    'dig-site-survey-grid-cache-1',
    'atmosphere-temple-scroll-cache',
    'catacomb-safe-ledge-evidence-2',
    'escape-shattered-bridge-blocks-2',
    'dig-site-rope-boundary-2',
    'dig-site-mapped-doorway-stones-2',
  ].forEach((propId) => {
    assert.match(storyProps, new RegExp(`id:\\s*'${propId}'`), `${propId} should be placed through STORY_PROPS`);
  });

  const atmospherePropMatches = [...storyProps.matchAll(/type:\s*'atmosphere-prop'/g)];
  assert.ok(atmospherePropMatches.length >= 38, 'atmosphere pass should keep coherent non-colliding prop clusters without ghost overlays');
  assert.match(storyProps, /catacomb-entry-urn-cluster-2[\s\S]*?catacomb-safe-ledge-evidence-2/);
  assert.match(storyProps, /dig-site-rope-boundary-2[\s\S]*?dig-site-rolled-canvas-2/);
  assert.doesNotMatch(storyProps, /desert-entry-visible-|opening-route-visible-|opening-pyramid-(?:ledge|terrace|upper)-/);
  assert.doesNotMatch(journeyComponentSource, /expedition-cache/);
  assert.doesNotMatch(storyProps, /id:\s*'(atmosphere-entry-coin-offering|scarab-seal-broken-offering-2|atmosphere-dig-coin-offering|ruined-temple-offering-table-1|catacomb-marker-flag-cache-1)'/);
  assert.doesNotMatch(storyProps, /id:\s*'(desert-entry-survey-rope-stakes-2|desert-entry-low-rubble-cluster-2|desert-entry-glyph-slab-low-2|scarab-seal-marker-left-2|scarab-seal-clean-pedestal-fragment-2|scarab-seal-marker-right-2|scarab-seal-shards-bait-line-2|temple-approach-seal-panel-1|temple-threshold-rubble-base-2|temple-threshold-fallen-cap-2|temple-warning-tablet-cluster-2)'/);
  assert.doesNotMatch(storyProps, /type:\s*'atmosphere-prop'[\s\S]{0,220}damage:/);
  assert.doesNotMatch(storyProps, /type:\s*'atmosphere-prop'[\s\S]{0,220}collectible:/);
  assert.doesNotMatch(storyProps, /type:\s*'atmosphere-prop'[\s\S]{0,220}requiresObjective:/);
  assert.doesNotMatch(
    extractExportedArray('STAGE_ENTRANCE_FEATURES'),
    /id:\s*'ruined-temple-colossus-gate'[\s\S]{0,420}visibleWhenLocked:\s*true/,
    'desert-to-temple doorway should not render as a ghosted locked-route overlay'
  );
});

test('conservative prop cleanup moves old canvas story props onto atlas-backed assets', () => {
  const storyProps = extractExportedArray('STORY_PROPS');
  const convertedProps = [
    ['temple-entry-flag', 'stoneTablet'],
    ['temple-broken-equipment-cart', 'fieldChest'],
    ['temple-warning-banner-line', 'torchStand'],
    ['escape-rubble-marker', 'sealedWallPanel'],
    ['escape-abandoned-survey-cart', 'fieldChest'],
    ['camp-lights', 'torchStand'],
    ['dig-site-supply-cart-line', 'fieldChest'],
    ['permit-clue-marker', 'sealedWallPanel'],
    ['pyramid-base-guardian-fragment', 'ankhSealPanel'],
    ['final-survey-lights', 'torchStand'],
    ['sealed-entrance-survey-lamps', 'torchStand'],
  ];

  convertedProps.forEach(([propId, assetKey]) => {
    const row = getDataRowById(storyProps, propId);
    assert.match(row, /type:\s*'atmosphere-prop'/, `${propId} should render through the atlas prop path`);
    assert.match(row, new RegExp(`atmosphereAssetKey:\\s*'${assetKey}'`), `${propId} should use ${assetKey}`);
    assert.doesNotMatch(row, /type:\s*'(sign|cart|sacred-lamps|lights|carved-wall|guardian-fragment|gate|paired-guardians)'/);
  });

  assert.match(journeyRenderAssetsSource, /'survey-rope':\s*'rope'/, 'survey rope story props should use the existing rope atlas region');
  assert.match(journeyComponentSource, /'survey-rope':\s*\{[\s\S]*?width:/, 'survey rope atlas props should have grounding dimensions');
  assert.doesNotMatch(storyProps, /type:\s*'(cart|sacred-lamps|lights|carved-wall|guardian-fragment|paired-guardians)'/);
});

test('conservative sign cleanup moves route signs onto atlas-backed props', () => {
  const storyProps = extractExportedArray('STORY_PROPS');
  const convertedSigns = [
    ['temple-threshold-switch-trail', 'sealedWallPanel'],
    ['sandfall-warning-marker', 'ankhSealPanel'],
    ['field-note-marker', 'stoneTablet'],
    ['temple-guardian-marker', 'ankhSealPanel'],
    ['catacomb-entry-marker', 'stoneTablet'],
    ['catacomb-pause-marker', 'stoneTablet'],
    ['catacomb-evidence-marker', 'stoneTablet'],
    ['serpent-boundary-marker', 'ankhSealPanel'],
    ['bridge-survey-flag', 'stoneTablet'],
    ['unstable-route-marker', 'sealedWallPanel'],
    ['captain-warning-marker', 'ankhSealPanel'],
    ['site-boundary-marker', 'stoneTablet'],
    ['safe-survey-pause-marker', 'stoneTablet'],
    ['construct-warning-marker', 'ankhSealPanel'],
  ];

  convertedSigns.forEach(([propId, assetKey]) => {
    const row = getDataRowById(storyProps, propId);
    assert.match(row, /type:\s*'atmosphere-prop'/, `${propId} should render through the atmosphere atlas path`);
    assert.match(row, new RegExp(`atmosphereAssetKey:\\s*'${assetKey}'`), `${propId} should use ${assetKey}`);
    assert.doesNotMatch(row, /type:\s*'sign'/, `${propId} should not use the old canvas sign renderer`);
  });

  assert.doesNotMatch(storyProps, /type:\s*'sign'/);
});

test('desert entry single-backdrop mode is bypassed in favor of the approved panorama', () => {
  assert.equal(desertEntryBackgroundAtlas.runtimeMode, 'single-composited-backdrop');
  assert.ok(Object.keys(desertEntryBackgroundAtlas.regions).includes('sky') && Object.keys(desertEntryBackgroundAtlas.regions).includes('groundingOverlay'));
  assert.equal(desertEntryBackgroundAtlas.regions.sky.image, undefined);
  assert.equal(desertEntryBackgroundAtlas.regions.groundingOverlay.image, 'desert-entry-grounding-overlay.png');
  assert.match(journeyBackgroundAssetsSource, /'groundingOverlay'/);
  assert.doesNotMatch(journeyComponentSource, /'groundingOverlay'/);
  assert.match(journeyComponentSource, /desert-entry-clean-panorama-only-2026-06-18/);
  assert.doesNotMatch(journeyComponentSource, /'dustOverlay'/);
  assert.doesNotMatch(journeyComponentSource, /'foregroundParallax'/);
});

test('desert entry grounding overlay stays a transparent archaeological sediment layer', () => {
  const overlayBytes = readFileSync(desertEntryGroundingOverlayPath);
  assert.equal(overlayBytes.toString('ascii', 1, 4), 'PNG');
  assert.equal(overlayBytes.readUInt32BE(16), desertEntryBackgroundAtlas.imageWidth);
  assert.equal(overlayBytes.readUInt32BE(20), desertEntryBackgroundAtlas.imageHeight);
  assert.equal(overlayBytes[25], 6, 'grounding overlay should be RGBA so the clean background remains canonical');
  [
    /buried ruin shelf/i,
    /sand drifts/i,
    /rubble fields/i,
    /contact shadows/i,
    /desert sediment/i,
    /ground-level dust haze/i,
  ].forEach((pattern) => {
    assert.match(desertEntryBackgroundAtlas.notes, pattern);
  });
});

test('desert entry foreground depth pack stays transparent, visual-only, and edge-framed', () => {
  assert.equal(existsSync(egyptForegroundDepthAtlasPath), true, 'foreground depth atlas metadata should exist');
  assert.equal(existsSync(egyptForegroundDepthPngPath), true, 'foreground depth atlas PNG should exist');
  const foregroundAtlas = JSON.parse(readFileSync(egyptForegroundDepthAtlasPath, 'utf8'));
  const foregroundBytes = readFileSync(egyptForegroundDepthPngPath);

  assert.equal(foregroundAtlas.image, 'egypt-foreground-depth-pack.png');
  assert.equal(foregroundBytes.toString('ascii', 1, 4), 'PNG');
  assert.equal(foregroundBytes[25], 6, 'foreground depth pack should be RGBA so existing scene art remains canonical');
  [
    'leftBrokenColumn',
    'rightBrokenColumn',
    'rubbleClusterLarge',
    'rubbleClusterSmall',
    'softSandDrift',
    'buriedCarvedHead',
    'damagedWallFragment',
    'dryShrub',
    'deadPalmRemnant',
    'lowDustVeil',
  ].forEach((key) => {
    assert.ok(foregroundAtlas.regions[key], `${key} should be present in the foreground depth pack`);
  });
  assert.match(foregroundAtlas.mappingNote, /visual-only/i);
  assert.match(foregroundAtlas.mappingNote, /terrain-level framing/i);
  assert.match(foregroundAtlas.mappingNote, /no collision/i);
  assert.match(foregroundAtlas.mappingNote, /does not replace existing artwork/i);
  assert.match(foregroundAtlas.mappingNote, /avoids tall ghosted ruin-cluster cutouts/i);
  assert.match(journeyRenderAssetsSource, /EGYPT_FOREGROUND_DEPTH_ASSET_VERSION/);
  assert.match(journeyRenderAssetsSource, /EGYPT_FOREGROUND_DEPTH/);
  assert.match(journeyComponentSource, /ENABLE_FOREGROUND_DEPTH_LAYER = false/);
  assert.match(journeyComponentSource, /drawForegroundDepthLayer/);
  assert.match(journeyComponentSource, /drawForegroundDepthParticles/);
  assert.doesNotMatch(journeyComponentSource, /drawRegion\('leftBrokenColumn'/);
  assert.doesNotMatch(journeyComponentSource, /drawRegion\('rightBrokenColumn'/);
  assert.doesNotMatch(journeyComponentSource, /FOREGROUND_DEPTH[\s\S]{0,240}PLATFORMS/);
});

test('premium foreground contact assets stay visual-only and out of generated structure collision', () => {
  const foregroundAtlas = JSON.parse(readFileSync(egyptForegroundDepthAtlasPath, 'utf8'));
  const premiumGroundContactAtlas = JSON.parse(readFileSync(new URL('../../../public/assets/expedition/environment/egypt-foreground/egypt-ground-contact-premium-kit-2026-06-02.json', import.meta.url), 'utf8'));
  const storyProps = extractExportedArray('STORY_PROPS');
  const generatedStructureRows = [
    getDataRowById(storyProps, 'forgotten-mural-climb-structure'),
    getDataRowById(storyProps, 'scribe-chamber-doorway-structure'),
  ];
  const backgroundStructureRow = getDataRowById(storyProps, 'mummification-chamber-exterior-structure');
  const platforms = extractExportedArray('PLATFORMS');

  [
    'egyptGroundSkirtLong',
    'egyptGroundSkirtShort',
    'egyptBaseSandDrift',
    'egyptRubbleContactShadow',
    'egyptBuriedStoneEdge',
    'egyptStructureBaseRubble',
  ].forEach((key) => {
    assert.ok(foregroundAtlas.regions[key], `${key} should be present in the foreground depth pack`);
    assert.match(journeyRenderAssetsSource, new RegExp(`'${key}'`), `${key} should be an expected foreground-depth key`);
  });
  [
    'premiumLongSandLip',
    'premiumLowSedimentRibbon',
    'premiumRubbleMoundBlend',
    'premiumDoorThresholdBuildup',
    'premiumRubbleContactShadow',
    'premiumHalfBuriedStairSupport',
    'premiumBrokenMasonryFooting',
    'premiumSmallStoneScatter',
  ].forEach((key) => {
    assert.ok(premiumGroundContactAtlas.regions[key], `${key} should be present in the premium ground-contact pack`);
    assert.match(journeyRenderAssetsSource, new RegExp(`'${key}'`), `${key} should be an expected premium ground-contact key`);
  });

  assert.match(foregroundAtlas.mappingNote, /ground-skirt/i);
  assert.match(foregroundAtlas.mappingNote, /contact shadow/i);
  assert.match(premiumGroundContactAtlas.mappingNote, /visual-only/i);
  assert.match(premiumGroundContactAtlas.mappingNote, /do not define collision/i);
  assert.match(backgroundStructureRow, /depth:\s*'background'/);
  assert.match(backgroundStructureRow, /groundContactLayer:\s*\[/);
  assert.match(backgroundStructureRow, /assetKey:\s*'premium(?:LowSedimentRibbon|RubbleMoundBlend|RubbleContactShadow|BrokenMasonryFooting|SmallStoneScatter)'/);
  generatedStructureRows.forEach((propRow) => {
    assert.match(propRow, /groundContactLayer:\s*\[/);
    assert.doesNotMatch(propRow, /assetKey:\s*'(?:egyptGroundSkirtLong|egyptGroundSkirtShort|lowDustVeil|egyptBaseSandDrift)'/);
    assert.match(propRow, /assetKey:\s*'premium(?:LongSandLip|LowSedimentRibbon|RubbleMoundBlend|DoorThresholdBuildup|RubbleContactShadow|HalfBuriedStairSupport|BrokenMasonryFooting|SmallStoneScatter)'/);
  });
  assert.match(journeyComponentSource, /drawEgyptStructureGroundContactLayer/);
  assert.match(journeyComponentSource, /groundContactLayer/);
  assert.match(journeyComponentSource, /drawEgyptStructureWeatheringOverlay/);
  assert.match(journeyComponentSource, /scribeChamberGroundBlendAssetKeys/);
  assert.doesNotMatch(platforms, /egyptGroundSkirtLong|premiumRubbleContactShadow|groundContactLayer/);
});

test('generated Egypt structures use localized premium ground contact without changing collision', () => {
  const storyProps = extractExportedArray('STORY_PROPS');
  const platforms = extractExportedArray('PLATFORMS');
  const generatedStructureIds = [
    'forgotten-mural-climb-structure',
    'scribe-chamber-doorway-structure',
  ];
  const backgroundStructure = STORY_PROPS.find((prop) => prop.id === 'mummification-chamber-exterior-structure');
  const generatedStructureRows = generatedStructureIds.map((id) => getDataRowById(storyProps, id));
  const generatedStructureProps = generatedStructureIds.map((id) => STORY_PROPS.find((prop) => prop.id === id));

  assert.equal(backgroundStructure?.depth, 'background');
  assert.ok(backgroundStructure?.groundContactLayer?.length >= 4);
  assert.ok(backgroundStructure.groundContactLayer.every((entry) => entry.assetKey.startsWith('premium')));
  generatedStructureRows.forEach((propRow) => {
    assert.match(propRow, /groundContactLayer:\s*\[/);
    assert.doesNotMatch(propRow, /assetKey:\s*'(?:lowDustVeil|egyptGroundSkirtLong|egyptGroundSkirtShort|egyptBaseSandDrift)'/);
  });
  generatedStructureProps.forEach((prop) => {
    assert.ok(prop, 'generated structure prop should exist');
    assert.ok(prop.groundContactLayer.length >= 4, `${prop.id} should have local contact pieces`);
    prop.groundContactLayer.forEach((entry) => {
      assert.match(entry.assetKey, /^premium/);
      assert.ok(!Number.isFinite(entry.widthRatio) || entry.widthRatio <= 0.86, `${entry.assetKey} should avoid broad full-width stamped haze`);
      assert.ok(['underlay', 'overlay'].includes(entry.layer || 'overlay'));
    });
  });

  assert.match(journeyComponentSource, /drawMummificationChamberExteriorAsset[\s\S]*?drawEgyptStructureGroundContactLayer/);
  assert.match(journeyComponentSource, /drawForgottenMuralGeneratedAsset[\s\S]*?drawEgyptStructureGroundContactLayer/);
  assert.match(journeyComponentSource, /mummificationGroundBlendAssetKeys/);
  assert.match(journeyComponentSource, /forgottenMuralGroundBlendAssetKeys/);
  assert.doesNotMatch(platforms, /premiumLongSandLip|premiumRubbleMoundBlend|groundContactLayer/);
});

test('generated Egypt structure data uses localized contact layers to prevent pasted-on bases', () => {
  const generatedStructureIds = new Set([
    'forgotten-mural-climb-structure',
    'scribe-chamber-doorway-structure',
  ]);
  const backgroundStructure = STORY_PROPS.find((prop) => prop.id === 'mummification-chamber-exterior-structure');
  const stampedContacts = STORY_PROPS
    .filter((prop) => generatedStructureIds.has(prop.id))
    .flatMap((prop) => (prop.groundContactLayer || []).map((entry) => ({ propId: prop.id, ...entry })))
    .map(({ propId, assetKey, mode, alpha, widthRatio }) => ({ propId, assetKey, mode, alpha, widthRatio }));

  assert.ok(backgroundStructure?.groundContactLayer?.length >= 4);
  assert.ok(backgroundStructure.groundContactLayer.every((entry) => entry.assetKey.startsWith('premium')));
  assert.ok(stampedContacts.length >= 12);
  assert.ok(stampedContacts.every(({ assetKey }) => assetKey.startsWith('premium')));
  assert.ok(stampedContacts.every(({ assetKey }) => !['lowDustVeil', 'egyptGroundSkirtLong', 'egyptGroundSkirtShort'].includes(assetKey)));
  assert.ok(stampedContacts.every(({ widthRatio }) => !Number.isFinite(widthRatio) || widthRatio <= 0.86));
  [
    'premiumRubbleContactShadow',
    'premiumLongSandLip',
    'premiumRubbleMoundBlend',
    'premiumDoorThresholdBuildup',
    'premiumHalfBuriedStairSupport',
    'premiumBrokenMasonryFooting',
    'premiumLowSedimentRibbon',
    'premiumSmallStoneScatter',
  ].forEach((assetKey) => {
    assert.ok(stampedContacts.some((entry) => entry.assetKey === assetKey), `${assetKey} should be used for structure blending`);
  });
});

test('generated Egypt structure contact layers use asymmetric buried-base polish', () => {
  const generatedStructureIds = new Set([
    'forgotten-mural-climb-structure',
    'scribe-chamber-doorway-structure',
  ]);
  const generatedStructures = STORY_PROPS.filter((prop) => generatedStructureIds.has(prop.id));

  generatedStructures.forEach((prop) => {
    const contacts = prop.groundContactLayer || [];
    const overlayContacts = contacts.filter((entry) => (entry.layer || 'overlay') === 'overlay');
    const sideBuildupContacts = contacts.filter((entry) => (
      Number.isFinite(entry.xRatio)
      && (entry.xRatio <= 0.28 || entry.xRatio >= 0.72)
      && Number.isFinite(entry.yOffset)
      && entry.yOffset <= -48
    ));
    assert.ok(contacts.length >= 8, `${prop.id} should have enough separate contact pieces to break a clean base line`);
    assert.ok(overlayContacts.every((entry) => !Number.isFinite(entry.widthRatio) || entry.widthRatio <= 0.68), `${prop.id} should avoid one broad overlay strip`);
    assert.ok(sideBuildupContacts.length >= 2, `${prop.id} should build sand/rubble into both side joins`);
    assert.ok(contacts.some((entry) => Number.isFinite(entry.rotation)), `${prop.id} should rotate at least one contact piece`);
    assert.ok(contacts.some((entry) => entry.mirrorX === true), `${prop.id} should mirror at least one repeated rubble/scatter piece`);
  });
});

test('generated overrides preserve polished structure contact layers when re-exported', () => {
  const mummificationOverride = journeyPlacementOverrides.props.find((prop) => prop.id === 'desert-entry-generated-mummification-chamber-entrance-1');
  const mummificationDoorway = journeyPlacementOverrides.props.find((prop) => prop.id === 'desert-entry-ravine-mummification-doorway-transition-1');
  const forgottenMuralClimbStructure = journeyPlacementOverrides.props.find((prop) => prop.id === 'forgotten-mural-climb-structure');
  const retiredGateFront = journeyPlacementOverrides.props.find((prop) => prop.id === 'desert-entry-route-gate-front-1');
  const retiredGateBack = journeyPlacementOverrides.props.find((prop) => prop.id === 'desert-entry-route-gate-back-1');
  assert.match(
    source,
    /id:\s*'guardian-prep-seal'[\s\S]*?suppressRouteGateVisual:\s*true[\s\S]*?physicalDoorwayPropId:\s*'desert-entry-ravine-mummification-doorway-transition-1'/,
  );
  assert.equal(mummificationOverride?.depth, 'route-edge');
  assert.equal(mummificationOverride?.layer, 'route-edge');
  assert.equal(mummificationOverride?.alpha, 0, 'The oversized Mummification exterior should stay visually retired so it does not draw a ruin row behind the physical doorway');
  assert.equal(retiredGateFront, undefined, 'The old route gate front should be deleted so it does not block the physical doorway');
  assert.equal(retiredGateBack, undefined, 'The old route gate back should be deleted so it does not block the physical doorway');
  assert.ok(journeyPlacementOverrides.deletedPropIds.includes('desert-entry-route-gate-front-1'));
  assert.ok(journeyPlacementOverrides.deletedPropIds.includes('desert-entry-route-gate-back-1'));
  assert.equal(mummificationDoorway?.depth, 'route-edge');
  assert.equal(mummificationDoorway?.layer, 'route-edge');
  assert.equal(mummificationDoorway?.alpha, 0, 'Physical Mummification doorway art should stay visually retired with the close ruin row');
  assert.equal(mummificationDoorway?.transitionPurpose, 'doorway-clean-cut');
  assert.equal(forgottenMuralClimbStructure?.alpha, 0, 'Forgotten Mural climb structure should stay visually retired so the Temple Approach view does not show a close ruin row');
  [
    'forgotten-mural-climb-structure',
  ].forEach((propId) => {
    const overrideProp = journeyPlacementOverrides.props.find((prop) => prop.id === propId);
    assert.ok(overrideProp, `${propId} generated override should exist for placement edits`);
    if (!Array.isArray(overrideProp.groundContactLayer)) return;
    const overlayContacts = overrideProp.groundContactLayer.filter((entry) => (entry.layer || 'overlay') === 'overlay');
    assert.ok(overrideProp.groundContactLayer.length >= 8, `${propId} generated override should keep separate contact pieces`);
    assert.ok(overlayContacts.every((entry) => !Number.isFinite(entry.widthRatio) || entry.widthRatio <= 0.68), `${propId} generated override should avoid a broad overlay strip`);
    assert.ok(overrideProp.groundContactLayer.some((entry) => Number.isFinite(entry.rotation)), `${propId} generated override should keep contact rotation`);
    assert.ok(overrideProp.groundContactLayer.some((entry) => entry.mirrorX === true), `${propId} generated override should keep mirrored contact pieces`);
  });
  assert.equal(
    journeyPlacementOverrides.props.find((prop) => prop.id === 'scribe-chamber-doorway-structure'),
    undefined,
    'Scribe exterior structure should stay deleted so it does not draw as a close ruin row over the clean panorama',
  );
  assert.ok(journeyPlacementOverrides.deletedPropIds.includes('scribe-chamber-doorway-structure'));
});

test('generated Egypt structure renderers avoid broad procedural base haze', () => {
  [
    'drawMummificationChamberExteriorAsset',
    'drawForgottenMuralGeneratedAsset',
    'drawScribeChamberDoorwayStructure',
  ].forEach((functionName) => {
    const functionSource = getComponentFunctionSource(functionName);
    assert.match(functionSource, /drawEgyptStructureGroundContactLayer/, `${functionName} should tolerate optional contact-layer data`);
    assert.match(functionSource, /drawEgyptStructureWeatheringOverlay/, `${functionName} should add local weathering and occlusion`);
    assert.doesNotMatch(functionSource, /drawRouteGroundApron/, `${functionName} should not paint a broad route apron`);
    assert.doesNotMatch(functionSource, /drawDecorativeBaseBlend/, `${functionName} should not paint a broad decorative base blend`);
    assert.doesNotMatch(functionSource, /drawGroundDustLip/, `${functionName} should not paint broad dust lips`);
  });
});

test('mummification background structure avoids boxed shadow treatment', () => {
  const functionSource = getComponentFunctionSource('drawMummificationChamberExteriorAsset');

  assert.doesNotMatch(functionSource, /drawContactShadow\(ctx,\s*x,\s*groundY/);
  assert.doesNotMatch(functionSource, /drop-shadow/);
});

test('generated Egypt structure contact renderer supports asymmetry controls', () => {
  const functionSource = getComponentFunctionSource('drawEgyptStructureGroundContactLayer');

  assert.match(functionSource, /entry\.rotation/);
  assert.match(functionSource, /entry\.mirrorX/);
  assert.match(functionSource, /ctx\.rotate/);
  assert.match(functionSource, /ctx\.scale/);
});

test('ground detail palette renders reusable contact sprites without atmosphere prop fallback art', () => {
  const drawStoryPropSource = getComponentFunctionSource('drawStoryProp');

  assert.match(journeyComponentSource, /createJourneyGroundDetailsPalette/);
  assert.match(journeyComponentSource, /selectedPaletteCategory === 'ground-detail'/);
  assert.match(journeyComponentSource, /\['ground-detail', 'Ground Details'\]/);
  assert.match(journeyComponentSource, /Ground Details palette/);
  assert.match(journeyComponentSource, /template\.groundDetailAssetKey/);
  assert.match(journeyComponentSource, /premiumGroundContactAssetsRef\.current/);
  assert.match(drawStoryPropSource, /detailContactLayer/);
  assert.match(drawStoryPropSource, /colorGradeFilter/);
  assert.match(drawStoryPropSource, /brightness\(/);
  assert.match(drawStoryPropSource, /prop\.type === 'ground-contact-detail-prop'/);
  assert.match(drawStoryPropSource, /drawEgyptStructureGroundContactLayer\(ctx, detailContactLayer/);
  assert.doesNotMatch(drawStoryPropSource, /getEnvironmentAssetKeyForStoryProp\(propForAsset, ENVIRONMENT_ASSET_PACK_IDS\.EGYPT_PREMIUM_GROUND_CONTACT\)/);
});

test('foreground detail palette renders foreground depth sprites without atmosphere prop fallback art', () => {
  const drawStoryPropSource = getComponentFunctionSource('drawStoryProp');

  assert.match(journeyComponentSource, /createJourneyForegroundDetailsPalette/);
  assert.match(journeyComponentSource, /selectedPaletteCategory === 'foreground-detail'/);
  assert.match(journeyComponentSource, /\['foreground-detail', 'Foreground Details'\]/);
  assert.match(journeyComponentSource, /Foreground Details palette/);
  assert.match(drawStoryPropSource, /prop\.type === 'ground-contact-detail-prop' \|\| prop\.type === 'foreground-depth-detail-prop'/);
  assert.match(drawStoryPropSource, /detailContactLayer/);
  assert.match(drawStoryPropSource, /drawEgyptStructureGroundContactLayer\(ctx, detailContactLayer/);
  assert.doesNotMatch(drawStoryPropSource, /getEnvironmentAssetKeyForStoryProp\(propForAsset, ENVIRONMENT_ASSET_PACK_IDS\.EGYPT_FOREGROUND_DEPTH\)/);
});

test('desert entry no longer draws old procedural fallback scenery', () => {
  assert.doesNotMatch(journeyComponentSource, /Parallax Hills/);
  assert.doesNotMatch(journeyComponentSource, /Parallax Ridges/);
  assert.doesNotMatch(journeyComponentSource, /drawDistantExpeditionWorker/);
  assert.doesNotMatch(journeyComponentSource, /drawKneelingSurveyor/);
  assert.doesNotMatch(journeyComponentSource, /drawTentFlap/);
  assert.doesNotMatch(journeyComponentSource, /drawRopedDigActivity/);
  assert.doesNotMatch(journeyComponentSource, /desert-survey-camp-life/);
});

test('desert entry ground reads as buried stone causeway under windblown sand', () => {
  assert.match(journeyComponentSource, /ROUTE_GROUND_VISUAL_MODE = 'buried-stone-causeway-under-windblown-sand-v1'/);
  assert.match(journeyComponentSource, /drawBuriedStoneCausewaySurface/);
  assert.match(journeyComponentSource, /section\.id !== 'desert-entry' \|\| platform\.y !== GROUND_Y/);
  assert.match(journeyComponentSource, /DESERT_ENTRY_BURIED_CAUSEWAY_GROUND_SRC = 'assets\/expedition\/backgrounds\/desert-entry\/desert-entry-premium-causeway-lane\.png'/);
  assert.match(journeyComponentSource, /DESERT_ENTRY_BURIED_CAUSEWAY_GROUND_VERSION = 'png-premium-causeway-lane-2026-06-02'/);
  assert.match(journeyComponentSource, /desertEntryBuriedCausewayGroundRef = useRef/);
  assert.match(journeyComponentSource, /ctx\.drawImage\(causewayAsset\.image/);
  assert.match(journeyComponentSource, /desertGroundStyle = 'buried-stone-causeway-under-windblown-sand'/);
  assert.match(journeyComponentSource, /drawBuriedStoneCausewaySurface\(ctx, platform, x, cameraX, Date\.now\(\)\)/);
  assert.equal(desertEntryBackgroundAtlas.regions.groundCausewayOverlay.image, 'desert-entry-premium-causeway-lane.png');
  const causewayBytes = readFileSync(desertEntryPremiumCausewayLanePath);
  assert.equal(causewayBytes.toString('ascii', 1, 4), 'PNG');
  assert.equal(causewayBytes.readUInt32BE(16), 1536);
  assert.equal(causewayBytes.readUInt32BE(20), 192);
  assert.equal(causewayBytes[25], 6, 'causeway overlay should be RGBA/transparent');
});

test('story props render local contact sediment and occlusion around asset bases', () => {
  const drawStoryPropSource = getComponentFunctionSource('drawStoryProp');
  const drawPropSandOcclusionSource = getComponentFunctionSource('drawPropSandOcclusion');

  assert.match(journeyComponentSource, /PROP_GROUNDING_INTEGRATION_VERSION = 'prop-contact-shadow-local-sediment-occlusion-v4'/);
  assert.match(journeyComponentSource, /defaultSandOverlap/);
  assert.match(journeyComponentSource, /sandMoundWidth:\s*finiteNumber\(config\.sandMoundWidth/);
  assert.match(journeyComponentSource, /groundPebbles:\s*finiteNumber\(config\.groundPebbles/);
  assert.match(drawStoryPropSource, /drawPropGroundContact\(ctx, x, anchorY, propSize, section\.id, propGrounding\)/);
  assert.match(drawStoryPropSource, /drawPropSandOcclusion\(ctx, x, anchorY, propSize, section\.id, propGrounding\)/);
  assert.match(drawPropSandOcclusionSource, /fillRect\(x - moundW \/ 2 - 2,\s*overlapY,\s*moundW \+ 4/);
  assert.match(journeyPlacementOverridesSource, /'colorGradeFilter'[\s\S]*'sandOverlapHeight'[\s\S]*'groundPebbles'/);
  [
    'desert-entry-premium-carved-stone-edge-1',
    'desert-entry-premium-broken-masonry-footing-1',
    'desert-entry-premium-rubble-contact-shadow-1',
    'desert-entry-premium-short-sand-lip-1',
  ].forEach((id) => {
    assert.ok(journeyPlacementOverrides.deletedPropIds.includes(id), `${id} should stay deleted from the clean Desert Entry panorama`);
  });
  assert.ok(
    journeyPlacementOverrides.deletedPropIds.includes('desert-entry-fallen-lintel-1'),
    'the old fallen lintel should stay deleted by the cleaned bridge/ramp layout',
  );
});

test('editor supports half-buried trap visuals without moving collision by hand', () => {
  assert.match(journeyTrapsSource, /edit\.burial/);
  assert.match(journeyComponentSource, /const getHazardBurialAmount = \(hazard = \{\}\) =>/);
  assert.match(journeyComponentSource, /drawHazardBurialCover/);
  assert.match(journeyComponentSource, /\(propEditorUi\.selectedHazard\.burial \|\| 0\)\.toFixed\(2\)/);
  assert.match(journeyComponentSource, /updateSelectedHazardEditorTransform\(\{ burial:/);
  assert.match(journeyComponentSource, /y: propEditorUi\.selectedHazard\.y \+ propEditorUi\.selectedHazard\.height - height/);
  assert.match(journeyComponentSource, /propEditorUi\.selectedProp\.category === 'Structure'/);
});

test('desert entry props use visible atlas art instead of weak placeholders', () => {
  const storyProps = extractExportedArray('STORY_PROPS');
  const deprecatedDesertPropIds = [
    'desert-entry-survey-chest-1',
    'opening-ruin-climb-fallen-column',
    'opening-ruin-climb-glyph-slab',
    'opening-footprint-trail',
    'half-buried-pottery-marker',
    'opening-threshold-offering',
    'atmosphere-entry-supply-jars',
    'desert-entry-buried-pottery-1',
    'scarab-seal-warning-glyph-1',
    'scarab-seal-broken-offering-1',
    'upper-route-note-marker',
    'starter-route-marker',
    'relic-shard-purpose-note',
    'opening-sacred-threshold-guardian',
    'forgotten-mural-alcove-panel',
    'abandoned-camp',
    'guardian-prep-warning-marker',
    'survey-note-cache-start',
    'desert-damaged-field-kit',
    'desert-evidence-flag',
    'broken-ruins-trail-marker',
    'scarab-warning-marker',
    'desert-entry-field-chest-1',
    'early-voucher-cache-marker',
    'broken-seal-marker',
    'atmosphere-entry-broken-pillar',
  ];

  deprecatedDesertPropIds.forEach((propId) => {
    assert.doesNotMatch(storyProps, new RegExp(`id:\\s*'${propId}'`), `${propId} should not render as Desert Entry clutter`);
  });

  [
    ['desert-entry-premium-threshold-slab-1', 'desertEntryPremiumThresholdSlab', /x:\s*(1[6-9]\d\d|2\d\d\d)/, 'should sit past Asha on the open route'],
    ['desert-entry-premium-column-1', 'desertEntryPremiumFallenColumn', /x:\s*(1[6-9]\d\d|2\d\d\d)/, 'should sit past Asha on the open route'],
    ['desert-entry-premium-pillar-caps-1', 'desertEntryPremiumPillarCaps', /x:\s*(1[6-9]\d\d|2\d\d\d)/, 'should sit past Asha on the open route'],
  ].forEach(([propId, assetKey, xPattern, xMessage]) => {
    const row = getDataRowById(storyProps, propId);
    assert.match(row, new RegExp(`atmosphereAssetKey:\\s*'${assetKey}'`), `${propId} should use atlas art`);
    assert.match(row, /placementPreset:\s*'desertEntryGroundedRuin'/, `${propId} should render through the grounded ruin preset`);
    assert.doesNotMatch(row, /alpha:\s*0\.[0-9]+/, `${propId} should not render as a transparent prop`);
    assert.match(row, /shadowOpacity:\s*0/, `${propId} should render without the generated shadow effect`);
    assert.match(row, xPattern, `${propId} ${xMessage}`);
  });

  assert.doesNotMatch(storyProps, /sectionId:\s*'desert-entry'[\s\S]{0,220}type:\s*'sign'/);
  assert.doesNotMatch(storyProps, /sectionId:\s*'desert-entry'[\s\S]{0,220}type:\s*'mural'/);
});

test('atlas story props default to opaque rendering unless explicitly edited', () => {
  const drawStoryPropSource = getComponentFunctionSource('drawStoryProp');

  assert.match(journeyComponentSource, /desertEntryGroundedRuin:[\s\S]*?alpha:\s*1/);
  assert.match(journeyComponentSource, /'atmosphere-prop': \{[\s\S]*?alpha:\s*1/);
  assert.match(drawStoryPropSource, /alpha:\s*1,\s*depth:\s*'midground'/);
  assert.match(drawStoryPropSource, /ctx\.globalAlpha = propSize\.alpha \?\? 1/);
});

test('small atmosphere floor assets are permanently ground-locked instead of background-tuned', () => {
  [
    'supplyJars',
    'fieldChest',
    'coinPile',
    'scrollCache',
    'rubbleScatter',
    'rubbleDustSmall',
    'fallenColumn',
    'pillarCaps',
  ].forEach((key) => {
    assert.match(journeyComponentSource, new RegExp(`'${key}'`));
  });

  assert.match(journeyComponentSource, /ATMOSPHERE_GROUND_LOCKED_ASSET_KEYS = new Set/);
  assert.match(journeyComponentSource, /isGroundLockedAtmosphereProp\(prop\)/);
  assert.match(journeyComponentSource, /shouldGroundLockAtmosphereProp = \(prop, propDepth\)/);
  assert.match(journeyComponentSource, /propDepth === 'route-edge' \|\| isGroundLockedAtmosphereProp\(prop\)/);
  assert.match(journeyComponentSource, /return 'grounded'/);
  assert.match(journeyComponentSource, /drawStoryProp\(ctx, prop, cameraX, now, 'grounded'\)/);
  assert.match(journeyComponentSource, /drawStoryProp\(ctx, prop, cameraX, now, 'route-edge'\)/);
  assert.match(journeyComponentSource, /Math\.max\(rawAnchorY, GROUND_Y - ATMOSPHERE_GROUND_LOCK_MARGIN\)/);
  assert.match(journeyComponentSource, /groundLockedAtmospherePropCount/);
  assert.match(journeyComponentSource, /PROP_DEPTH_TUNING_VERSION = 'journey-grounded-placement-presets-2026-05-26'/);
  assert.match(journeyComponentSource, /atmosphereGroundingMode:\s*'ground-locked-floor-and-route-edge-assets'/);
  assert.doesNotMatch(journeyComponentSource, /groundLocked.*parallax/);
});

test('route ground uses a narrow floor edge instead of a full-width bottom haze', () => {
  assert.match(journeyComponentSource, /ROUTE_GROUND_VISUAL_MODE = 'buried-stone-causeway-under-windblown-sand-v1'/);
  assert.match(journeyComponentSource, /ROUTE_GROUND_HAZE_FIX_VERSION = 'route-ground-buried-stone-causeway-2026-06-01'/);
  assert.match(journeyComponentSource, /const floorBandTop = GROUND_Y -/);
  assert.match(journeyComponentSource, /routeGroundVisualMode: ROUTE_GROUND_VISUAL_MODE/);
  assert.match(journeyComponentSource, /routeGroundHazeFixVersion: ROUTE_GROUND_HAZE_FIX_VERSION/);
  assert.doesNotMatch(journeyComponentSource, /const pathBottom = CANVAS_HEIGHT/);
  assert.doesNotMatch(journeyComponentSource, /ctx\.lineTo\(CANVAS_WIDTH, pathBottom\)/);
  assert.doesNotMatch(journeyComponentSource, /routeGroundVisualMode = 'wide-sand-stone-apron'/);
});

test('painted dynamic effects stay limited to moments that read clearly as static art', () => {
  ['shrine-glow', 'rockfall', 'ruin-collapse'].forEach((type) => {
    assert.equal(usesPaintedDynamicWorldEffect(type), true, `${type} should use the painted effect sheet`);
  });
  ['dust-gust', 'birds-scatter', 'moving-fog', 'unstable-excavation'].forEach((type) => {
    assert.equal(usesPaintedDynamicWorldEffect(type), false, `${type} should use procedural motion cues`);
  });
});

test('combat pressure encounters guard optional rewards without blocking progression', () => {
  const egyptEnemies = extractExportedArray('ENEMIES');
  const chinaEnemies = extractExportedArray('CHINA_ENEMIES');
  const allEnemies = `${egyptEnemies}\n${chinaEnemies}`;

  assert.match(allEnemies, /encounterRole:/);
  assert.match(allEnemies, /pressureHint:/);
  [
    'desert-upper-survey-route',
    'temple-cracked-wall-passage',
    'escape-shortcut-arch',
    'china-cracked-wall-archive',
    'china-watchtower-rope-route',
    'china-unstable-bridge-cache',
  ].forEach((routeId) => {
    assert.match(allEnemies, new RegExp(`protectsRouteId:\\s*'${routeId}'`));
  });
  assert.match(allEnemies, /route pressure/);
  assert.match(allEnemies, /watchtower pressure/);
  assert.match(allEnemies, /collapsing-bridge pressure/);
  assert.match(journeyUtilsSource, /scarab:\s*2/);
  assert.match(journeyUtilsSource, /looter:\s*3/);
  assert.match(journeyUtilsSource, /const tunedHealth = clamp\(Math\.max\(enemy\.health \+ bonus, Math\.ceil\(enemy\.health \* 1\.55\)\), 3, 5\) \* COMBAT_DAMAGE_SCALE/);
  assert.match(journeyUtilsSource, /enemy\.type === 'scorpion' \? Math\.ceil\(tunedHealth \* 1\.5\) : tunedHealth/);
  assert.match(journeyUtilsSource, /Math\.ceil\(enemy\.health \* 1\.55\)/);
  assert.match(journeyUtilsSource, /if\s*\(enemy\.firstSealRouteRamp\)\s*return Math\.max\(1, enemy\.damage\)/);
  assert.match(journeyUtilsSource, /Math\.ceil\(enemy\.damage \* 1\.35\)/);
  assert.match(journeyUtilsSource, /baseSpeed: entity\.speed \* \(entity\.openingRouteRamp \? 1\.12 : 1\.32\)/);
  assert.match(journeyComponentSource, /const ENEMY_TACTICAL_PRESSURE = \{/);
  assert.match(journeyComponentSource, /awarenessMultiplier/);
  assert.match(journeyComponentSource, /chaseMultiplier/);
  assert.match(journeyComponentSource, /shieldDuringWindup: tunedPattern\.shieldDuringWindup \|\| Boolean\(pressure\.shieldDuringWindup\)/);
  assert.match(journeyComponentSource, /if \(isPressingPlayer\) \{[\s\S]*?e\.direction = distanceToPlayer >= 0 \? 1 : -1;/);
});

test('Egypt opening combat ramps gently before the first route seal', () => {
  const egyptEnemies = extractExportedArray('ENEMIES');
  const readAuthoredX = (row) => {
    const scaled = row.match(/x:\s*X\((\d+)\)/);
    if (scaled) return Number(scaled[1]);
    return Number(row.match(/x:\s*(\d+)/)?.[1] || Number.POSITIVE_INFINITY);
  };
  const openingRows = egyptEnemies
    .split('\n')
    .filter(row => /x:\s*(?:X\()?(\d+)/.test(row))
    .filter((row) => readAuthoredX(row) < 1480);

  const teachingRows = openingRows
    .filter((row) => readAuthoredX(row) <= 705)
    // The scorpion-nest arena and the ravine bridge encounter are intentional moderate
    // combat beats near the mummification building, not gentle teaching enemies, so they
    // are excluded from the teaching-read checks below.
    .filter((row) => !/scorpion-nest|nest arena|ravine bridge/.test(row));
  const totalOpeningHealth = openingRows
    .reduce((total, row) => total + Number(row.match(/health:\s*(\d+)/)?.[1] || 0), 0);
  const totalOpeningDamage = openingRows
    .reduce((total, row) => total + Number(row.match(/damage:\s*(\d+)/)?.[1] || 0), 0);
  const highDamageOpeningRows = openingRows
    .filter((row) => Number(row.match(/damage:\s*(\d+)/)?.[1] || 0) > 8);

  assert.ok(teachingRows.length >= 3, 'opening route should teach smaller creature reads before the first seal');
  assert.match(source, /id:\s*'opening-seal-reset-trap'[\s\S]*?penalty:\s*\{\s*stamina:\s*8\s*\}/);
  assert.equal(
    openingRows.every(row => /openingRouteRamp:\s*true/.test(row)),
    true,
    'Egypt enemies before the first seal should opt into the opening-route safety tuning',
  );
  assert.equal(
    teachingRows.every(row => /firstSealRouteRamp:\s*true/.test(row)),
    true,
    'first-seal proof enemies should opt into the gentlest opening route tuning',
  );
  assert.match(journeyUtilsSource, /if\s*\(enemy\.firstSealRouteRamp\)\s*\{[\s\S]*?const tunedHealth = Math\.max\(3, enemy\.health\) \* COMBAT_DAMAGE_SCALE/);
  assert.match(journeyUtilsSource, /if\s*\(enemy\.firstSealRouteRamp\)\s*return Math\.max\(1, enemy\.damage\)/);
  assert.equal(
    teachingRows.every(row => Number(row.match(/health:\s*(\d+)/)?.[1] || 0) <= 2 && Number(row.match(/damage:\s*(\d+)/)?.[1] || 0) <= 5),
    true,
    'first teaching enemies should keep low authored health and low damage so the seal proof stays readable',
  );
  // Budget raised intentionally: the opening now includes the scorpion-nest arena AND the
  // ravine bridge encounter (the first major environmental combat beat, immediately before the
  // Mummification Chamber). Both still use openingRouteRamp tuning and avoid high-damage (>8)
  // enemies, so the opening stays fair while ramping toward the bridge crossing. The bridge's
  // real threat is the deadly fall (knockback), not raw enemy damage.
  assert.ok(totalOpeningHealth <= 40, 'first seal should not require too many regular enemy hits before the guardian');
  assert.ok(totalOpeningDamage <= 124, 'opening regular enemy damage budget should leave room for early-route mistakes');
  assert.equal(highDamageOpeningRows.length, 0, 'opening route should avoid high-damage regular enemies before the first seal');

  const checkpoints = extractExportedArray('CHECKPOINTS');
  assert.match(checkpoints, /id:\s*'desert-survey-marker'/);
  assert.match(checkpoints, /x:\s*X\(930\)/);
});

test('normal enemies take at least three weapon hits at runtime', () => {
  const runtimeEnemies = [...ENEMIES, ...CHINA_ENEMIES].map(makeEnemy);
  const minHits = 3 * COMBAT_DAMAGE_SCALE; // at least three light hits on the combat damage scale
  const tooFragileEnemies = runtimeEnemies
    .filter(enemy => enemy.maxHealth < minHits || enemy.health < minHits)
    .map(enemy => `${enemy.id}:${enemy.health}/${enemy.maxHealth}`);

  assert.deepEqual(tooFragileEnemies, []);
  assert.equal(
    runtimeEnemies
      .filter(enemy => enemy.firstSealRouteRamp)
      .every(enemy => enemy.health >= minHits && enemy.maxHealth >= minHits),
    true,
    'first-seal teaching enemies should still take at least three weapon hits',
  );
});

test('regular enemy families use distinct combat role timings without a new AI system', () => {
  assert.match(journeyComponentSource, /const ENEMY_ATTACK_PATTERNS = \{/);
  assert.match(journeyGameplayContractSource, /const ENEMY_AGGRO_MEMORY_SECONDS = 7\.5/);
  assert.match(journeyGameplayContractSource, /const ENEMY_AGGRO_PATROL_PADDING = 320/);
  assert.match(journeyComponentSource, /scarab:\s*\{[\s\S]*?awareness:\s*1\.70[\s\S]*?chase:\s*2\.05/);
  assert.match(journeyComponentSource, /scorpion:\s*\{[\s\S]*?awareness:\s*1\.60[\s\S]*?chase:\s*1\.85/);
  assert.match(journeyComponentSource, /scarab:\s*\{[\s\S]*?id:\s*'charge'[\s\S]*?windup:\s*0\.42[\s\S]*?speed:\s*185[\s\S]*?range:\s*38/);
  assert.match(journeyComponentSource, /scorpion:\s*\{[\s\S]*?id:\s*'sting'[\s\S]*?windup:\s*0\.6[\s\S]*?duration:\s*0\.3[\s\S]*?speed:\s*54[\s\S]*?range:\s*28[\s\S]*?height:\s*58[\s\S]*?yOffset:\s*-34[\s\S]*?backReach:\s*38[\s\S]*?damageScale:\s*1\.45/);
  assert.match(journeyComponentSource, /snake:\s*\{[\s\S]*?id:\s*'lunge'[\s\S]*?windup:\s*0\.62[\s\S]*?speed:\s*166[\s\S]*?range:\s*52/);
  assert.match(journeyComponentSource, /'sand-wisp':\s*\{[\s\S]*?id:\s*'sand-burst'[\s\S]*?windup:\s*0\.5[\s\S]*?speed:\s*150/);
  assert.match(journeyComponentSource, /guardian:\s*\{[\s\S]*?id:\s*'slam'[\s\S]*?windup:\s*0\.84[\s\S]*?speed:\s*52[\s\S]*?shieldDuringWindup:\s*true/);
  assert.match(journeyComponentSource, /if \(e\.attackTimer > 0\) \{[\s\S]*?const scarabPoisonChargeBoost = e\.type === 'scarab' && playerIsVenomSlowed \? SCARAB_POISONED_CHARGE_SPEED_MULTIPLIER : 1[\s\S]*?e\.x \+= e\.attackDirection \* pattern\.speed \* scarabPoisonChargeBoost \* dt/);
  assert.match(journeyComponentSource, /openEnemyCounterWindow\(e, pattern\);/);
  assert.match(journeyCombatContractSource, /const openEnemyCounterWindow = \(enemy, pattern\) => \{[\s\S]*?enemy\.attackRecovery = pattern\.recovery;[\s\S]*?enemy\.vulnerabilityTimer = pattern\.vulnerableAfter;/);
  assert.match(journeyComponentSource, /e\.aggroMemoryTimer = Math\.max\(e\.aggroMemoryTimer \|\| 0, ENEMY_AGGRO_MEMORY_SECONDS \* \(tacticalPattern\.aggroMemoryMultiplier \|\| 1\)\)/);
  assert.match(journeyComponentSource, /const isAggroChasing = \(e\.aggroMemoryTimer \|\| 0\) > 0/);
  assert.match(journeyComponentSource, /const slowPursuitBoost = e\.type === 'scorpion' && playerIsVenomSlowed \? 1\.48 : 1/);
  assert.match(journeyComponentSource, /const chaseSpeedMultiplier = isAggroChasing[\s\S]*?\? \(tacticalPattern\.chaseMultiplier \|\| 1\.65\) \* \(e\.type === 'scorpion' \? SCORPION_CHASE_SPEED_MULTIPLIER \* slowPursuitBoost : 1\)[\s\S]*?: 1/);
  assert.match(journeyComponentSource, /const movementMin = isAggroChasing \? e\.patrolMin - ENEMY_AGGRO_PATROL_PADDING : e\.patrolMin/);
});

test('scorpion and scarab combo creates tactical poison and armor pressure', () => {
  const scorpion = makeEnemy({ id: 'combat-scorpion', type: 'scorpion', name: 'Combat Scorpion', x: 100, y: 100, width: 44, height: 30, health: 2, damage: 4 });
  assert.equal(scorpion.health, 60);
  assert.equal(scorpion.maxHealth, 60);

  assert.match(journeyCombatContractSource, /SCORPION_VENOM_SLOW_DURATION = 3\.6/);
  assert.match(journeyComponentSource, /const SCARAB_POISONED_CHARGE_SPEED_MULTIPLIER = 1\.28/);
  assert.match(journeyComponentSource, /const SCARAB_POISONED_CHARGE_START_BONUS = 110/);
  assert.match(journeyComponentSource, /const scarabPoisonChargeCanReach = e\.type === 'scarab'[\s\S]*?playerIsVenomSlowed[\s\S]*?nearPlayer[\s\S]*?SCARAB_POISONED_CHARGE_START_BONUS/);
  assert.match(journeyComponentSource, /const scarabPoisonChargeBoost = e\.type === 'scarab' && playerIsVenomSlowed \? SCARAB_POISONED_CHARGE_SPEED_MULTIPLIER : 1/);
  assert.match(journeyComponentSource, /e\.x \+= e\.attackDirection \* pattern\.speed \* scarabPoisonChargeBoost \* dt/);
  assert.match(journeyComponentSource, /Scarab charges faster while venom slows Asha\. Dodge behind it\./);
  assert.doesNotMatch(journeyComponentSource, /drawScarabFrontalArmorCue/);
  assert.match(journeyComponentSource, /current\.notice = 'Scarab shell absorbed the blow\. Dodge behind it after the charge\.'/);
  assert.match(journeyComponentSource, /const playerHeight = PLAYER_HEIGHT/);
  assert.match(journeyComponentSource, /const groundPlayerY = GROUND_Y - playerHeight/);

  const nestOverride = journeyPlacementOverrides.enemies.find(enemy => enemy.id === 'desert-entry-scorpion-nest-1');
  assert.ok(nestOverride, 'The opening scorpion nest should keep its generated placement override');
  assert.ok(nestOverride.y < 650, 'The opening scorpion nest must remain visible in the combat arena');
});

test('scorpion nest becomes the post-Mummification destroy-to-pass obstacle', () => {
  const mummificationExterior = journeyPlacementOverrides.props.find(prop => prop.id === 'desert-entry-generated-mummification-chamber-entrance-1');
  const muralExterior = journeyPlacementOverrides.props.find(prop => prop.id === 'forgotten-mural-climb-structure');
  const nestOverride = journeyPlacementOverrides.enemies.find(enemy => enemy.id === 'desert-entry-scorpion-nest-1');
  const nestData = ENEMIES.find(enemy => enemy.id === 'desert-entry-scorpion-nest-1');

  assert.ok(mummificationExterior, 'Mummification Chamber exterior placement should exist');
  assert.ok(muralExterior, 'Forgotten Mural exterior placement should exist as the next major structure');
  assert.ok(nestOverride, 'The existing scorpion nest should be moved through its generated placement override');
  assert.ok(nestData, 'The existing scorpion nest enemy row should remain the canonical implementation');

  const routeProgress = (nestOverride.x - mummificationExterior.x) / (muralExterior.x - mummificationExterior.x);
  assert.ok(routeProgress >= 0.25 && routeProgress <= 0.45, 'Nest should sit after the Mummification Chamber before the mural structure');
  assert.ok(nestOverride.x > mummificationExterior.x, 'Nest should be after the Mummification Chamber exterior');
  assert.ok(nestOverride.x < muralExterior.x, 'Nest should be before the Forgotten Mural structure');
  assert.equal(nestData.type, 'scorpion-nest');
  assert.equal(nestData.combatRole, 'destructible spawner');
  assert.match(nestData.pressureHint, /Destroy the nest to stop the swarm/);
  assert.equal(nestOverride.widthScale, 0.3);

  assert.match(journeyComponentSource, /const getLiveScorpionNestBlockers = useCallback/);
  assert.match(journeyComponentSource, /enemy\.type === 'scorpion-nest'[\s\S]*?!enemy\.defeated[\s\S]*?getEditedNestParams\(enemy\)/);
  assert.match(journeyComponentSource, /The scorpion nest blocks the route\. Destroy it to clear the path\./);
  assert.match(journeyComponentSource, /audioControls\?\.playExpeditionSfx\?\.\('gateBlocked'\)/);
  assert.match(journeyComponentSource, /nest\.type !== 'scorpion-nest' \|\| nest\.defeated/);
  assert.match(journeyComponentSource, /x:\s*nest\.x \+ nest\.width \/ 2 - 23 \+ spawnDir \* 18/);
  assert.match(journeyComponentSource, /const nestBaseY = nest\.y \+ nest\.height/);
  assert.match(journeyComponentSource, /y:\s*nestBaseY - broodHeight - 2/);
  assert.doesNotMatch(journeyComponentSource, /y:\s*GROUND_Y - broodHeight - 2/);
  assert.match(journeyComponentSource, /patrolMin:\s*nest\.x - 150/);
  assert.match(journeyComponentSource, /patrolMax:\s*nest\.x \+ nest\.width \+ 150/);
  assert.match(journeyComponentSource, /nestParentId:\s*nest\.id/);
});

test('combat audio uses creature and deflection cues instead of gate sounds', () => {
  assert.match(appSource, /combatDeflect:\s*\{/);
  assert.match(appSource, /scarabHit:\s*\{/);
  assert.match(appSource, /scorpionHit:\s*\{/);
  assert.match(appSource, /snakeHit:\s*\{/);
  assert.match(appSource, /sandWispHit:\s*\{/);
  assert.match(appSource, /bossHit:\s*\{/);
  assert.match(appSource, /playerImpact/);
  assert.match(appSource, /scarabShellHit/);
  assert.match(appSource, /window\.__playExpeditionSfxDebug/);
  assert.match(appSource, /window\.__expeditionSfxLog/);
  assert.match(journeyComponentSource, /const ENEMY_HIT_SFX_BY_TYPE = \{/);
  assert.match(journeyComponentSource, /scarab:\s*'scarabHit'/);
  assert.match(journeyComponentSource, /scorpion:\s*'scorpionHit'/);
  assert.match(journeyComponentSource, /snake:\s*'snakeHit'/);
  assert.match(journeyComponentSource, /'sand-wisp':\s*'sandWispHit'/);
  assert.match(journeyComponentSource, /getEnemyHitSfxKey\(e\)/);
  assert.match(journeyGameplayContractSource, /blocked:\s*\{[\s\S]*?sfxKey:\s*'combatDeflect'/);
  assert.match(journeyComponentSource, /audioControls\?\.playExpeditionSfx\?\.\(resolvedSfxKey/);
  assert.match(journeyComponentSource, /bossHit.*playExpeditionSfx|playExpeditionSfx.*bossHit|hitSfx.*bossHit/);
  assert.doesNotMatch(journeyComponentSource, /blocked the rushed hit[\s\S]{0,180}playExpeditionSfx\?\.\('gateBlocked'/);
});

test('fast fluid combat slice adds dodge-cancel and flow combo contracts', () => {
  assert.match(journeyGameplayContractSource, /const PLAYER_DODGE_STAMINA_COST = \d+/);
  assert.match(journeyGameplayContractSource, /const PLAYER_DODGE_DURATION = 0\.\d+/);
  assert.match(journeyGameplayContractSource, /const PLAYER_DODGE_INVULNERABLE_DURATION = 0\.\d+/);
  assert.match(journeyGameplayContractSource, /const PLAYER_DODGE_FRAME_SEQUENCE = \[0,\s*1,\s*2,\s*2,\s*2,\s*3,\s*3,\s*4,\s*5,\s*6,\s*7\]/);
  assert.match(journeyGameplayContractSource, /const PLAYER_COMBO_WINDOW_DURATION = 0\.\d+/);
  assert.match(journeyGameplayContractSource, /const PLAYER_COMBO_PRESERVE_AFTER_DODGE_DURATION = 0\.\d+/);
  assert.match(journeyGameplayContractSource, /const PLAYER_ATTACK_FINISHER_DAMAGE = \d+/);
  assert.match(journeyUtilsSource, /attackComboWindowTimer:\s*0/);
  assert.match(journeyUtilsSource, /attackComboLanded:\s*false/);
  assert.match(journeyUtilsSource, /dodgeTimer:\s*0/);
  assert.match(journeyUtilsSource, /dodgeFacingDirection:\s*0/);
  assert.match(journeyComponentSource, /const queueDodge = useCallback\(\(\) => \{/);
  assert.match(journeyComponentSource, /if \(current\.attackTimer > 0 && !current\.attackComboLanded\) resetPlayerCombo\(current\);/);
  assert.match(journeyComponentSource, /if \(current\.attackComboLanded\) current\.attackComboWindowTimer = Math\.max\(current\.attackComboWindowTimer \|\| 0, PLAYER_COMBO_PRESERVE_AFTER_DODGE_DURATION\);/);
  assert.match(journeyComponentSource, /current\.playerAttackBox = null;/);
  assert.match(journeyComponentSource, /current\.dodgeInvulnerableTimer = PLAYER_DODGE_INVULNERABLE_DURATION;/);
  assert.match(journeyComponentSource, /const dodgeFacingDirection = -dodgeDirection;/);
  assert.match(journeyComponentSource, /current\.dodgeFacingDirection = dodgeFacingDirection;/);
  assert.match(journeyComponentSource, /player\.direction = dodgeFacingDirection;/);
  assert.match(journeyComponentSource, /e\.health -= isFinisher \? PLAYER_ATTACK_FINISHER_DAMAGE : \(isParry \? PLAYER_ATTACK_PARRY_DAMAGE : \(isHeavyAttack \? PLAYER_ATTACK_SHOVE_DAMAGE : PLAYER_ATTACK_LIGHT_DAMAGE\)\)/);
  assert.match(journeyComponentSource, /const heavyFollowupPrimed = isHeavyAttack && finisherAllowed && \(current\.attackQueuedHeavyFollowupPrimed \|\| \(current\.attackComboWindowTimer > 0 && current\.attackComboLanded\)\);/);
  assert.match(journeyComponentSource, /if \(current\.attackComboWindowTimer <= 0 && current\.attackSequenceIndex > 0 && current\.attackPhase === 'ready'\) resetPlayerCombo\(current\);/);
  assert.match(journeyComponentSource, /audioControls\?\.playExpeditionSfx\?\.\(isFinisher \? 'attackFinisher' : isHeavyAttack \? 'attackSwing2' : 'attackSwing1'\)/);
  assert.match(appSource, /dodgeStep:\s*\{/);
  assert.match(appSource, /attackSwing1:\s*\{/);
  assert.match(appSource, /attackSwing2:\s*\{/);
  assert.match(appSource, /attackFinisher:\s*\{/);
  assert.match(appSource, /attackMiss:\s*\{/);
  assert.match(appSource, /finisherHit:\s*\{/);
});

test('combat telegraphs are colour-coded by danger and unblockable attacks cannot be parried', () => {
  // Sekiro-style telegraph language: gold = normal, orange = heavy, red = unblockable.
  assert.match(journeyComponentSource, /const ATTACK_TELEGRAPH_CLASSES = \{/);
  assert.match(journeyComponentSource, /normal:\s*\{[^}]*color:\s*'#facc15'[^}]*parryable:\s*true/);
  assert.match(journeyComponentSource, /heavy:\s*\{[^}]*color:\s*'#fb7a1e'[^}]*parryable:\s*true/);
  assert.match(journeyComponentSource, /unblockable:\s*\{[^}]*color:\s*'#ef4444'[^}]*parryable:\s*false/);
  // Classifier: shielded heavy charges (protectedDuringWindup) are the unblockable/red set.
  assert.match(journeyComponentSource, /const getEnemyAttackTelegraph = \(enemy, heavyPatterns = \{\}\) => \{/);
  assert.match(journeyComponentSource, /if \(isHeavyActive && heavy\.protectedDuringWindup\) return ATTACK_TELEGRAPH_CLASSES\.unblockable;/);
  assert.match(journeyComponentSource, /if \(isHeavyActive\) return ATTACK_TELEGRAPH_CLASSES\.heavy;/);
  // Unblockable attacks cannot be parried — both the defensive parry and the player-hit parry path are gated.
  assert.match(journeyComponentSource, /&& getEnemyAttackTelegraph\(e, HEAVY_ATTACK_PATTERNS\)\.parryable\s+&& rectsOverlap\(attackRect, getAttackHurtbox\(e\)\)/);
  assert.match(journeyComponentSource, /const isParry = getEnemyAttackTelegraph\(e, HEAVY_ATTACK_PATTERNS\)\.parryable/);
  // The telegraph render uses the class colour, and the first red attack teaches the player.
  assert.match(useJourneyRendererSource, /const telegraph = getEnemyAttackTelegraph\(enemy, HEAVY_ATTACK_PATTERNS\);/);
  assert.match(journeyComponentSource, /current\.redAttackHintShown = true;/);
  assert.match(journeyComponentSource, /glows RED/);
});

test('perfect dodge deflects any attack and the single Esc/"?" menu teaches the controls', () => {
  // Perfect dodge: a last-instant dodge (still in i-frames) deflects + staggers and refunds Endurance.
  assert.match(journeyComponentSource, /const PERFECT_DODGE_ENDURANCE_REWARD = \d+/);
  assert.match(journeyComponentSource, /const playerIsPerfectDodging = current\.dodgeInvulnerableTimer > 0;/);
  assert.match(journeyComponentSource, /current\.lastAttackResult = 'perfect-dodge';/);
  assert.match(journeyComponentSource, /current\.resources\.stamina \+ PERFECT_DODGE_ENDURANCE_REWARD/);
  // Perfect dodge is evaluated before the parry/damage branches, so it wins even on red attacks.
  assert.match(journeyComponentSource, /if \(playerIsPerfectDodging\) \{[\s\S]*?\} else if \(playerIsParrying\)/);

  // Shared controls reference, authored once and exported for reuse by the
  // briefing primer and the consolidated pause menu.
  assert.match(journeyComponentSource, /export function JourneyControlsReference\(\{ compactMovementKeys = false \} = \{\}\) \{/);
  assert.match(journeyComponentSource, /keys: \['A', 'D', '←', '→'\], label: 'Move'/);
  assert.match(journeyComponentSource, /keys: \['W', 'Space', '↑'\], label: 'Jump'/);
  assert.match(journeyComponentSource, /label: 'Dodge'/);
  assert.match(journeyComponentSource, /const JOURNEY_TELEGRAPH_LEGEND = \[/);
  assert.match(journeyComponentSource, /Perfect dodge:/);

  // The separate in-journey help button + overlay are gone: one surface only.
  assert.doesNotMatch(journeyComponentSource, /journey-help-btn/);
  assert.doesNotMatch(journeyComponentSource, /helpOpen/);
  assert.doesNotMatch(indexCssSource, /\.journey-help-overlay\s*\{/);

  // The single pause menu (opened by Esc or "?") owns the controls reference now.
  assert.match(expeditionModeSource, /import ExpeditionJourney, \{ JourneyControlsReference \} from '\.\/ExpeditionJourney';/);
  assert.match(expeditionModeSource, /e\.code === 'Escape' \|\| e\.code === 'Slash'/);
  assert.match(expeditionModeSource, /<JourneyControlsReference compactMovementKeys \/>/);

  // Styles exist.
  assert.match(indexCssSource, /\.journey-telegraph-dot\s*\{/);
});

test('combo finisher uses the approved slash overlay through combat hit effects', () => {
  const slashBytes = readFileSync(ashaFinisherSlashEffectPath);
  assert.equal(slashBytes.toString('ascii', 1, 4), 'PNG');
  assert.equal(slashBytes.readUInt32BE(16), 636);
  assert.equal(slashBytes.readUInt32BE(20), 294);
  assert.equal(slashBytes[25], 6, 'finisher slash should stay RGBA so it can render as an overlay');

  assert.match(journeyGameplayContractSource, /const PLAYER_FINISHER_SLASH_EFFECT_SRC = 'assets\/expedition\/player\/asha-finisher-slash-effect-2026-06-06\.png';/);
  assert.match(journeyComponentSource, /const playerFinisherSlashEffectRef = useRef\(\{ image: null, loaded: false, failed: false, version: PLAYER_FINISHER_SLASH_EFFECT_VERSION \}\);/);
  assert.match(journeyComponentSource, /playerFinisherSlashEffectRef\.current = \{ image, loaded: true, failed: false, version: PLAYER_FINISHER_SLASH_EFFECT_VERSION \};/);
  assert.match(journeyComponentSource, /image\.src = `\$\{import\.meta\.env\.BASE_URL\}\$\{PLAYER_FINISHER_SLASH_EFFECT_SRC\}\?v=\$\{PLAYER_FINISHER_SLASH_EFFECT_VERSION\}`;/);

  const finisherDrawStart = useJourneyRendererSource.indexOf("if (effect.type === 'finisher-slash') {");
  const finisherDrawEnd = useJourneyRendererSource.indexOf("if (['movement-dust'", finisherDrawStart);
  assert.notEqual(finisherDrawStart, -1, 'finisher slash draw branch should exist');
  assert.notEqual(finisherDrawEnd, -1, 'finisher slash draw branch should remain before normal compact effects');
  const finisherDrawBranch = useJourneyRendererSource.slice(finisherDrawStart, finisherDrawEnd);
  assert.match(finisherDrawBranch, /const slashState = playerFinisherSlashEffectRef\.current;/);
  assert.match(finisherDrawBranch, /ctx\.globalCompositeOperation = 'lighter';/);
  assert.match(finisherDrawBranch, /if \(direction < 0\) ctx\.scale\(-1, 1\);/);
  assert.match(finisherDrawBranch, /ctx\.drawImage\(\s*slashState\.image,/);

  assert.match(journeyComponentSource, /current\.lastAttackResult = isFinisher \? 'finisher' :/);
  assert.match(journeyGameplayContractSource, /finisher:\s*\{[\s\S]*?slashEffect:\s*'finisher'[\s\S]*?slashWidth:\s*260[\s\S]*?slashTimer:\s*0\.34[\s\S]*?sfxKey:\s*'finisherHit'/);
  assert.match(journeyComponentSource, /type: profile\.slashEffect === 'finisher' \? 'finisher-slash' : 'combo-slash'/);
  assert.match(journeyComponentSource, /hitType:\s*isParry \? 'combo2' : combatHitImpactType/);
  assert.match(journeyComponentSource, /suppressSlash:\s*isParry/);
});

test('combo opening hits use a restrained realistic slash overlay before the finisher payoff', () => {
  const slashBytes = readFileSync(ashaComboSlashEffectPath);
  assert.equal(slashBytes.toString('ascii', 1, 4), 'PNG');
  assert.equal(slashBytes.readUInt32BE(16), 420);
  assert.equal(slashBytes.readUInt32BE(20), 210);
  assert.equal(slashBytes[25], 6, 'combo slash should stay RGBA so normal hits keep a realistic overlay');

  assert.match(journeyGameplayContractSource, /const PLAYER_COMBO_SLASH_EFFECT_SRC = 'assets\/expedition\/player\/asha-combo-slash-effect-2026-06-06\.png';/);
  assert.match(journeyComponentSource, /const playerComboSlashEffectRef = useRef\(\{ image: null, loaded: false, failed: false, version: PLAYER_COMBO_SLASH_EFFECT_VERSION \}\);/);
  assert.match(journeyComponentSource, /playerComboSlashEffectRef\.current = \{ image, loaded: true, failed: false, version: PLAYER_COMBO_SLASH_EFFECT_VERSION \};/);
  assert.match(journeyComponentSource, /image\.src = `\$\{import\.meta\.env\.BASE_URL\}\$\{PLAYER_COMBO_SLASH_EFFECT_SRC\}\?v=\$\{PLAYER_COMBO_SLASH_EFFECT_VERSION\}`;/);

  const comboDrawStart = useJourneyRendererSource.indexOf("if (effect.type === 'combo-slash') {");
  const comboDrawEnd = useJourneyRendererSource.indexOf("if (effect.type === 'finisher-slash')", comboDrawStart);
  assert.notEqual(comboDrawStart, -1, 'combo slash draw branch should exist');
  assert.notEqual(comboDrawEnd, -1, 'combo slash should draw before the finisher branch');
  const comboDrawBranch = useJourneyRendererSource.slice(comboDrawStart, comboDrawEnd);
  assert.match(comboDrawBranch, /const slashState = playerComboSlashEffectRef\.current;/);
  assert.match(comboDrawBranch, /ctx\.globalCompositeOperation = 'lighter';/);
  assert.match(comboDrawBranch, /if \(direction < 0\) ctx\.scale\(-1, 1\);/);
  assert.match(comboDrawBranch, /ctx\.drawImage\(\s*slashState\.image,/);

  assert.match(journeyGameplayContractSource, /light:\s*\{[\s\S]*?slashEffect:\s*'combo'[\s\S]*?slashWidth:\s*138[\s\S]*?slashTimer:\s*0\.2/);
  assert.match(journeyGameplayContractSource, /combo2:\s*\{[\s\S]*?slashEffect:\s*'combo'[\s\S]*?slashWidth:\s*178[\s\S]*?slashTimer:\s*0\.24[\s\S]*?sfxKey:\s*'combatHitCombo2'/);
  assert.match(journeyComponentSource, /type: profile\.slashEffect === 'finisher' \? 'finisher-slash' : 'combo-slash'/);
  assert.match(journeyComponentSource, /comboStep:\s*hitType === 'combo2' \? 2 : 1/);
  assert.match(journeyComponentSource, /suppressSlash:\s*isParry/);
  assert.doesNotMatch(journeyComponentSource, /lastAttackResult !== 'finisher'[\s\S]*type:\s*'finisher-slash'/);
});

test('combat hit impact feedback is centralized by physical hit type profiles', () => {
  assert.match(journeyGameplayContractSource, /const COMBAT_HIT_IMPACT_PROFILES = \{/);
  ['light', 'combo2', 'shove', 'finisher', 'blocked', 'defeated'].forEach((hitType) => {
    assert.match(
      journeyGameplayContractSource,
      new RegExp(`${hitType}:\\s*\\{[\\s\\S]*?hitStop:[\\s\\S]*?cameraShakeStrength:[\\s\\S]*?hitFlash:[\\s\\S]*?targetKnockback`),
      `${hitType} impact profile should own physical feedback tuning`,
    );
  });
  assert.match(journeyComponentSource, /const applyCombatHitImpact = useCallback\(\(\{/);
  assert.match(journeyComponentSource, /type: profile\.slashEffect === 'finisher' \? 'finisher-slash' : 'combo-slash'/);
  assert.match(journeyComponentSource, /type:\s*'knockback-dust'/);
  assert.match(journeyComponentSource, /audioControls\?\.playExpeditionSfx\?\.\(resolvedSfxKey/);
  assert.match(journeyComponentSource, /applyCombatHitImpact\(\{[\s\S]*?hitType:\s*'blocked'/);
  assert.match(journeyComponentSource, /const combatHitImpactType = isFinisher[\s\S]*?'finisher'[\s\S]*?'defeated'[\s\S]*?'shove'[\s\S]*?'light'/);
  assert.match(journeyComponentSource, /applyCombatHitImpact\(\{[\s\S]*?hitType:\s*isParry \? 'combo2' : combatHitImpactType/);
  assert.match(appSource, /combatHitCombo2:\s*\{/);
  assert.match(appSource, /enemyDefeated:\s*\{/);
});

test('unprimed heavy K is a shove: chip damage, strong knockback, reliable stagger', () => {
  // Chip damage constant (~30% of a light hit on the combat scale), distinct from light
  assert.match(journeyGameplayContractSource, /const PLAYER_ATTACK_SHOVE_DAMAGE = Math\.round\(0\.3 \* COMBAT_DAMAGE_SCALE\)/);
  // Unprimed heavy deals shove damage, not light or finisher damage
  assert.match(journeyComponentSource, /isParry \? PLAYER_ATTACK_PARRY_DAMAGE : \(isHeavyAttack \? PLAYER_ATTACK_SHOVE_DAMAGE : PLAYER_ATTACK_LIGHT_DAMAGE\)/);
  // Dedicated shove impact profile: strong knockback / near-finisher spacing, big dust kick
  assert.match(journeyGameplayContractSource, /shove:\s*\{[\s\S]*?targetKnockback:\s*0\.6[\s\S]*?targetShift:\s*96[\s\S]*?dustWidth:\s*50/);
  // Unprimed heavy routes through the shove impact, not combo2
  assert.match(journeyComponentSource, /: isHeavyAttack\s*\?\s*'shove'\s*:\s*'light'/);
  // Longer, reliable interrupt stagger than a light hit (light = 0.8s)
  assert.match(journeyComponentSource, /e\.stunTimer = isFinisher \? 1\.55 : \(isParry \? 1\.4 : \(isHeavyAttack \? 1\.1 :/);
  // Shove still primes nothing and earns no Endurance refund (it is a survival tool, not a payoff)
  assert.match(journeyComponentSource, /heavyFollowupRefund = isFinisher \? PLAYER_HEAVY_FOLLOWUP_HIT_REFUND : \(isParry \? 8 : \(isHeavyAttack \? 0 : 1\)\)/);
});

test('step 3 earned-Endurance rewards: defeat +4 and boss stagger +10', () => {
  assert.match(journeyGameplayContractSource, /const PLAYER_DEFEAT_ENDURANCE_REWARD = 4/);
  assert.match(journeyGameplayContractSource, /const PLAYER_BOSS_STAGGER_ENDURANCE_REWARD = 10/);
  // Defeating an enemy grants the clamped defeat reward with notice feedback
  assert.match(journeyComponentSource, /enduranceBeforeDefeat \+ PLAYER_DEFEAT_ENDURANCE_REWARD/);
  assert.match(journeyComponentSource, /if \(defeatEnduranceGained > 0\) current\.notice =/);
  // Boss stagger reward: capture the vulnerable opening before it is reset, reward once per opening
  assert.match(journeyComponentSource, /const bossWasVulnerable = b\.vulnerabilityTimer > 0 \|\| b\.attackRecovery > 0/);
  assert.match(journeyComponentSource, /if \(bossWasVulnerable && !b\.staggerRewarded\) \{[\s\S]{0,260}PLAYER_BOSS_STAGGER_ENDURANCE_REWARD[\s\S]{0,160}b\.staggerRewarded = true;/);
  // Flag resets when the boss opens a fresh vulnerability window
  assert.match(journeyComponentSource, /b\.vulnerabilityTimer = phase\.vulnerableAfter;\s*b\.staggerRewarded = false;/);
  // Boss factory initialises the flag
  assert.match(journeyUtilsSource, /awakened:\s*false,\s*staggerRewarded:\s*false,/);
});

test('combat uses explicit J light and K heavy follow-up instead of hidden same-button combo', () => {
  assert.match(journeyGameplayContractSource, /const PLAYER_ATTACK_TYPES = Object\.freeze\(\{[\s\S]*?LIGHT:\s*'light'[\s\S]*?HEAVY:\s*'heavy'/);
  assert.match(journeyGameplayContractSource, /const PLAYER_HEAVY_FOLLOWUP_HIT_REFUND = \d+/);
  assert.match(journeyUtilsSource, /attackQueuedType:\s*'light'/);
  assert.match(journeyUtilsSource, /heavyFollowupReadyTimer:\s*0/);
  assert.match(journeyComponentSource, /const queueAttack = useCallback\(\(attackType = PLAYER_ATTACK_TYPES\.LIGHT\) => \{/);
  assert.match(journeyComponentSource, /current\.attackQueuedType = attackType === PLAYER_ATTACK_TYPES\.HEAVY\s*\? PLAYER_ATTACK_TYPES\.HEAVY\s*:\s*PLAYER_ATTACK_TYPES\.LIGHT;/);
  assert.match(journeyComponentSource, /if \(e\.code === 'KeyJ'\) \{ queueAttack\(PLAYER_ATTACK_TYPES\.LIGHT\); return; \}/);
  assert.match(journeyComponentSource, /if \(e\.code === 'KeyK'\) \{ queueAttack\(PLAYER_ATTACK_TYPES\.HEAVY\); return; \}/);
  assert.doesNotMatch(journeyComponentSource, /if \(e\.code === 'KeyJ' \|\| e\.code === 'KeyK'\) \{ queueAttack\(\); return; \}/);

  assert.match(journeyComponentSource, /const queuedAttackType = current\.attackQueuedType === PLAYER_ATTACK_TYPES\.HEAVY[\s\S]*?const isHeavyAttack = queuedAttackType === PLAYER_ATTACK_TYPES\.HEAVY/);
  assert.match(journeyComponentSource, /const finisherAllowed = !current\.enduranceExhausted;/);
  assert.match(journeyComponentSource, /const heavyFollowupPrimed = isHeavyAttack && finisherAllowed && \(current\.attackQueuedHeavyFollowupPrimed \|\| \(current\.attackComboWindowTimer > 0 && current\.attackComboLanded\)\);/);
  assert.match(journeyComponentSource, /const nextAttackSequenceIndex = heavyFollowupPrimed[\s\S]*?PLAYER_COMBO_MAX_STEP[\s\S]*?isHeavyAttack[\s\S]*?2[\s\S]*?1/);
  assert.match(journeyComponentSource, /current\.attackComboFinisherActive = heavyFollowupPrimed;/);
  assert.match(journeyComponentSource, /if \(isHeavyAttack && !heavyFollowupPrimed\) applyAttackStaminaCost\(PLAYER_ATTACK_FINISHER_EXTRA_STAMINA_COST, 'Heavy swing'\);/);

  assert.match(journeyComponentSource, /current\.heavyFollowupReadyTimer = primesHeavyFollowup \? PLAYER_COMBO_WINDOW_DURATION : 0;/);
  assert.match(journeyComponentSource, /type:\s*'heavy-ready-cue'/);
  assert.match(journeyComponentSource, /const heavyFollowupRefund = isFinisher \? PLAYER_HEAVY_FOLLOWUP_HIT_REFUND/);
  assert.match(journeyComponentSource, /current\.resources\.stamina = Math\.min\(current\.upgradeEffects\?\.maxStamina \|\| 100, current\.resources\.stamina \+ heavyFollowupRefund\);/);
});

test('heavy follow-up window is readable through HUD and physical cue feedback', () => {
  assert.match(journeyGameplayContractSource, /const PLAYER_HEAVY_FOLLOWUP_PROMPT_LABEL = 'K';/);
  assert.match(journeyGameplayContractSource, /const PLAYER_HEAVY_FOLLOWUP_CUE_DURATION = 0\.42;/);
  assert.match(journeyUtilsSource, /heavyFollowupCueTimer:\s*0/);
  assert.match(journeyComponentSource, /heavyFollowupPromptActive:\s*\(current\.heavyFollowupReadyTimer \|\| 0\) > 0/);
  assert.match(journeyComponentSource, /heavyFollowupCueMs:\s*Math\.round\(\(current\.heavyFollowupCueTimer \|\| 0\) \* 1000\)/);
  assert.match(journeyComponentSource, /gameState\.playerCombatState\?\.heavyFollowupReady/);
  assert.match(journeyComponentSource, /className="journey-heavy-followup-cue"/);
  assert.match(journeyComponentSource, /<kbd>\{PLAYER_HEAVY_FOLLOWUP_PROMPT_LABEL\}<\/kbd>/);
  assert.match(indexCssSource, /\.journey-heavy-followup-cue/);
  assert.match(indexCssSource, /@keyframes journey-heavy-followup-pulse/);
  assert.match(journeyComponentSource, /current\.heavyFollowupCueTimer = primesHeavyFollowup \? PLAYER_HEAVY_FOLLOWUP_CUE_DURATION : 0;/);
  assert.match(journeyComponentSource, /Math\.max\(current\.heavyFollowupReadyTimer \|\| 0, current\.heavyFollowupCueTimer \|\| 0\)/);
});

test('heavy follow-up input buffers during the visible combo window until Asha is ready', () => {
  assert.match(journeyUtilsSource, /attackQueuedHeavyFollowupPrimed:\s*false/);
  assert.match(journeyComponentSource, /const canBufferHeavyFollowup\s*=[\s\S]{0,220}current\.attackComboWindowTimer > 0[\s\S]{0,220}current\.attackComboLanded/);
  assert.match(journeyComponentSource, /if \(current\.attackCooldown > 0 \|\| current\.attackWindupTimer > 0 \|\| current\.attackTimer > 0 \|\| current\.attackRecoilTimer > 0\) \{[\s\S]{0,360}current\.attackQueuedHeavyFollowupPrimed = true;/);
  assert.match(journeyComponentSource, /const attackActionReady = current\.attackCooldown <= 0[\s\S]{0,180}current\.attackRecoilTimer <= 0;/);
  assert.match(journeyComponentSource, /if \(current\.attackQueued && attackActionReady\) \{/);
  assert.match(journeyComponentSource, /const heavyFollowupPrimed = isHeavyAttack && finisherAllowed && \(current\.attackQueuedHeavyFollowupPrimed[\s\S]{0,160}current\.attackComboLanded\)/);
  assert.match(journeyComponentSource, /current\.attackQueuedHeavyFollowupPrimed = false;/);
});

test('missed attacks give physical near-miss spacing feedback without widening hitboxes', () => {
  assert.match(journeyGameplayContractSource, /const PLAYER_ATTACK_NEAR_MISS_DISTANCE = 44;/);
  assert.match(journeyGameplayContractSource, /const PLAYER_ATTACK_NEAR_MISS_VERTICAL_TOLERANCE = 34;/);
  assert.match(journeyComponentSource, /const getPlayerAttackNearMissTarget = useCallback\(\(current, attackRect\) => \{/);
  assert.match(journeyComponentSource, /const gap = direction >= 0\s*\? hurtbox\.x - \(attackRect\.x \+ attackRect\.width\)\s*:\s*attackRect\.x - \(hurtbox\.x \+ hurtbox\.width\);/);
  assert.match(journeyComponentSource, /gap >= 0 && gap <= PLAYER_ATTACK_NEAR_MISS_DISTANCE/);
  assert.match(journeyComponentSource, /verticalGap <= PLAYER_ATTACK_NEAR_MISS_VERTICAL_TOLERANCE/);
  assert.match(journeyComponentSource, /const expiredAttackBox = wasSwinging && current\.attackTimer <= 0 \? current\.playerAttackBox : null;/);
  assert.match(journeyComponentSource, /const nearMissTarget = getPlayerAttackNearMissTarget\(current, expiredAttackBox\);/);
  assert.match(journeyComponentSource, /type:\s*'near-miss-spacing'/);
  assert.match(journeyComponentSource, /current\.lastAttackResult = nearMissTarget \? 'near-miss' : 'missed';/);
  assert.match(journeyComponentSource, /current\.notice = 'Close - step in and land J before K\.';/);
  assert.match(journeyComponentSource, /if \(effect\.type === 'near-miss-spacing'\) \{/);
  assert.doesNotMatch(journeyComponentSource, /PLAYER_ATTACK_RANGE\s*=\s*9[3-9]|PLAYER_ATTACK_RANGE\s*=\s*1\d{2}/);
});

test('dodge visual state uses the preview dodge atlas row with the old fallback intact', () => {
  const dodgeRow = ashaReferenceWarriorDodgePreviewAtlas.rows.find((row) => row.name === 'dodge');

  assert.match(journeyUtilsSource, /if \(current\.dodgeTimer > 0\) return 'dodge';/);
  assert.match(journeyUtilsSource, /if \(animationState === 'dodge'\) return 3;/);
  assert.match(journeyUtilsSource, /dodgeTrail:\s*\[\]/);
  assert.match(journeyConstantsSource, /asha-reference-warrior-dodge-preview-spritesheet\.json/);
  assert.equal(ashaReferenceWarriorDodgePreviewAtlas.image, 'asha-reference-warrior-dodge-preview-spritesheet.png');
  assert.equal(dodgeRow?.row, 14);
  assert.equal(dodgeRow?.frameCount, 8);
  assert.equal(dodgeRow?.loop, false);
  assert.match(journeyConstantsSource, /asha-reference-warrior-dodge-backstep-tone-matched-2026-06-05/);
  assert.equal(ashaReferenceWarriorDodgePreviewAtlas.source, 'asha-reference-warrior-dodge-backstep-tone-matched-2026-06-05');
  assert.equal(ashaReferenceWarriorDodgePreviewAtlas.status, 'approved-asha-reference-warrior-dodge-backstep-tone-matched');
  assert.equal(dodgeRow?.frames?.[3], 'dodge_03');
  assert.equal(ashaReferenceWarriorDodgePreviewAtlas.regions.dodge_02.w, 390);
  assert.equal(ashaReferenceWarriorDodgePreviewAtlas.regions.dodge_02.h, 256);
  assert.equal(ashaReferenceWarriorDodgePreviewAtlas.regions.dodge_02.groundLineY, 236);
  assert.equal(ashaReferenceWarriorDodgePreviewAtlas.regions.dodge_06.w, 390);
  assert.equal(ashaReferenceWarriorDodgePreviewAtlas.regions.dodge_07.h, 256);
  assert.match(ashaReferenceWarriorDodgePreviewAtlas.poseSources.dodge_02, /asha-reference-warrior-dodge-backstep-approved-3120x256-2026-06-05\.png:frame_02/);
  assert.match(ashaReferenceWarriorDodgePreviewAtlas.poseSources.dodge_06, /asha-reference-warrior-dodge-backstep-approved-3120x256-2026-06-05\.png:frame_06/);
  assert.match(ashaReferenceWarriorDodgePreviewAtlas.poseSources.dodge_07, /asha-reference-warrior-dodge-backstep-approved-3120x256-2026-06-05\.png:frame_07/);
  assert.match(journeyComponentSource, /if \(animationState === 'dodge'\) \{/);
  assert.match(journeyComponentSource, /getHeroSpriteRow\(atlas,\s*'dodge'\)\s*\|\|\s*getHeroSpriteRow\(atlas,\s*'run'\)/);
  assert.match(journeyComponentSource, /PLAYER_DODGE_FRAME_SEQUENCE\[Math\.min\(PLAYER_DODGE_FRAME_SEQUENCE\.length - 1, Math\.floor\(dodgeProgress \* PLAYER_DODGE_FRAME_SEQUENCE\.length\)\)\]/);
  assert.match(journeyComponentSource, /const dodgeProgress = current\.dodgeTimer > 0/);
  assert.match(journeyComponentSource, /const dedicatedDodgeDuck = usingDedicatedDodgeFrame \? Math\.sin\(Math\.PI \* clamp\(dodgeElapsedProgress, 0, 1\)\) : 0;/);
  assert.match(journeyComponentSource, /const usingDedicatedDodgeFrame = typeof heroFrameKey === 'string' && heroFrameKey\.startsWith\('dodge_'\);/);
  assert.match(journeyComponentSource, /heroAtlas\?\.regions\?\.\[heroFrameKey\]\s*\|\|\s*heroAtlas\?\.frames\?\.\[heroFrameKey\]/);
  assert.match(journeyComponentSource, /const movementLean = usingDedicatedDodgeFrame\s*\?\s*0/);
  assert.match(journeyComponentSource, /const applyRuntimeDodgeEffects = dodging && !usingDedicatedDodgeFrame;/);
  assert.match(journeyComponentSource, /const dodgeLean = applyRuntimeDodgeEffects \? \(current\.dodgeDirection \|\| direction\) \* 14 \* dodgeProgress : 0;/);
  assert.match(journeyComponentSource, /const hasDedicatedDodgeRow = playerSpriteRef\.current\.mode === 'hero-atlas'/);
  assert.match(journeyComponentSource, /current\.dodgeTrail\?\.length && !hasDedicatedDodgeRow/);
  assert.match(journeyComponentSource, /current\.dodgeTimer > 0 && hasDedicatedDodgeRow/);
  assert.match(journeyComponentSource, /current\.dodgeTrail = \[\];/);
  assert.match(journeyComponentSource, /current\.dodgeTrail\.unshift/);
  assert.match(journeyComponentSource, /drawPlayerSprite\(ctx, ghost\.x - cameraX, ghost\.y, player\.width, player\.height, ghost\.dir, 0, now\)/);
});

test('hazards and traps use trap audio instead of door sounds', () => {
  assert.match(appSource, /trapReset:\s*\{/);
  assert.match(appSource, /trapStoneTrigger:\s*\{/);
  assert.match(appSource, /trapSandTrigger:\s*\{/);
  assert.match(appSource, /trapReset/);
  assert.match(appSource, /trapStoneTrigger/);
  assert.match(appSource, /trapSandTrigger/);
  assert.match(journeyComponentSource, /const SAND_TRAP_HAZARD_IDS = new Set/);
  assert.match(journeyComponentSource, /const getHazardSfxKey = \(hazard\) =>/);
  assert.match(journeyComponentSource, /hazard\?\.pushToStart\) return 'trapReset'/);
  assert.match(journeyComponentSource, /return 'trapStoneTrigger'/);
  assert.match(journeyComponentSource, /getHazardSfxKey\(h\)/);
  assert.doesNotMatch(journeyComponentSource, /pushToStart[\s\S]{0,1600}playExpeditionSfx\?\.\('gateBlocked'/);
});

test('enemy hits land harder while player pushback stays short', () => {
  assert.match(journeyUtilsSource, /enemy\.openingRouteRamp\s*\?\s*Math\.max\(enemy\.damage \+ 1, Math\.ceil\(enemy\.damage \* 1\.3\)\)/);
  assert.match(journeyUtilsSource, /if\s*\(enemy\.firstSealRouteRamp\)\s*return Math\.max\(1, enemy\.damage\)/);
  assert.match(journeyUtilsSource, /Math\.max\(enemy\.damage \+ 3, Math\.ceil\(enemy\.damage \* 1\.35\)\)/);
  assert.match(journeyComponentSource, /player\.knockbackMaxTimer = Math\.max\(0\.06, 0\.12 \* effectiveKnockbackMultiplier\)/);
  assert.match(journeyComponentSource, /player\.vx = approach\(player\.vx, direction \* 95 \* effectiveKnockbackMultiplier, 160\)/);
  assert.match(journeyComponentSource, /player\.vx \+= player\.knockbackDirection \* \(55 \+ knockbackProgress \* 42\.5\) \* knockbackMultiplier/);
});

test('enemy threat pass slice 4: danger scaling, wound state, depth pressure, and combat roles', () => {
  // Mid/late enemies hit harder than the opening ramp, but the inflation stays mild
  // (1.35x) now that heavy attacks resolve at their full damage scales.
  assert.match(journeyUtilsSource, /Math\.max\(enemy\.damage \+ 3, Math\.ceil\(enemy\.damage \* 1\.35\)\)/);
  // Wound state: enemies below half health attack faster
  assert.match(journeyComponentSource, /woundState|wound_state|woundMultiplier|e\.health.*e\.maxHealth.*0\.5|health.*maxHealth.*wound/i);
  // Depth pressure: enemies past X(1480) have shorter cooldowns
  assert.match(journeyComponentSource, /depthCooldownMultiplier|deepZone.*cooldown|cooldown.*deepZone|X\(1480\)|scaleJourneyX\(1480\)|8360/);
  // Scorpion, snake, mummy, bat cooldowns tightened — enemies attack more frequently
  assert.doesNotMatch(journeyComponentSource, /scorpion:[\s\S]{0,300}cooldown:\s*1\.[3-9][0-9]/);
  assert.doesNotMatch(journeyComponentSource, /snake:[\s\S]{0,300}cooldown:\s*1\.[3-9][0-9]/);
  assert.doesNotMatch(journeyComponentSource, /mummy:[\s\S]{0,300}cooldown:\s*1\.[5-9][0-9]/);
  assert.doesNotMatch(journeyComponentSource, /bat:[\s\S]{0,300}cooldown:\s*1\.[2-9][0-9]/);
});

test('Journey HUD can disable enemies for bridge playtesting without deleting combat data', () => {
  assert.match(journeyUtilsSource, /enemiesDisabled:\s*false/);
  assert.match(journeyComponentSource, /const toggleEnemyPlaytestAssist = useCallback/);
  assert.match(journeyComponentSource, /const nextEnemiesDisabled = !current\.enemiesDisabled/);
  assert.match(journeyComponentSource, /current\.enemiesDisabled = nextEnemiesDisabled/);
  assert.match(journeyComponentSource, /current\.bossDomain = null/);
  assert.match(journeyComponentSource, /aria-pressed=\{gameState\.enemiesDisabled\}/);
  assert.match(journeyComponentSource, /className=\{`journey-enemy-toggle \$\{gameState\.enemiesDisabled \? 'is-off' : ''\}`\}/);
  assert.match(journeyComponentSource, /if \(!current\.arrivalThresholdActive && !current\.enemiesDisabled\) current\.enemies\.forEach/);
  assert.match(journeyComponentSource, /if \(!current\.enemiesDisabled\) current\.miniBosses\.forEach/);
  assert.match(journeyComponentSource, /if \(enemiesDisabled\) \{[\s\S]*?current\.enemies\.forEach\(e => \{[\s\S]*?e\.attackWindup = 0/);
  assert.match(journeyComponentSource, /if \(!enemiesDisabled\) current\.enemies\.forEach\(nest =>/);
  assert.match(journeyComponentSource, /if \(!enemiesDisabled\) current\.miniBosses\.forEach\(b =>/);
  assert.match(journeyComponentSource, /const enemiesDisabled = Boolean\(current\?\.enemiesDisabled\)/);
  assert.match(journeyComponentSource, /Enemies are disabled for play-testing/);
  assert.match(journeyComponentSource, /enemyPlaytestAssistActive: enemiesDisabled/);
});

test('opening enemy role overrides preserve first-route fairness and readable counters', () => {
  const egyptEnemies = extractExportedArray('ENEMIES');
  assert.doesNotMatch(egyptEnemies, /id:\s*'warrior-mummy-(start|dune|ridge)-1'/);
  assert.match(egyptEnemies, /id:\s*'warrior-mummy-threshold-1'[\s\S]*?name:\s*'Threshold Warrior Mummy'[\s\S]*?type:\s*'mummy'[\s\S]*?attackPatternTuning:\s*\{[\s\S]*?id:\s*'snake-temple-step-1'/);
  assert.match(egyptEnemies, /id:\s*'warrior-mummy-relic-guard-1'[\s\S]*?type:\s*'mummy'[\s\S]*?protectsRouteId:\s*'temple-cracked-wall-passage'/);
  assert.match(egyptEnemies, /id:\s*'warrior-mummy-catacomb-1'[\s\S]*?name:\s*'Catacomb Warrior Mummy'[\s\S]*?type:\s*'mummy'/);
  assert.match(journeyComponentSource, /'opening-seal-reset-trap':\s*'spikeTrap'/);
  assert.match(journeyComponentSource, /'opening-seal-reset-trap':\s*\{\s*xPad:\s*18,\s*widthPad:\s*36,\s*height:\s*42,\s*footInset:\s*28\s*\}/);
  assert.doesNotMatch(journeyComponentSource, /warningAlpha/);
  assert.doesNotMatch(journeyComponentSource, /hitActive[\s\S]{0,240}strokeStyle = 'rgba\(248, 113, 113/);
  assert.doesNotMatch(journeyComponentSource, /text:\s*'BOUNCE'/);
  assert.doesNotMatch(journeyComponentSource, /text:\s*'RESET'/);
  assert.match(journeyComponentSource, /spikeTrap:\s*\{\s*xPad:\s*12,\s*widthPad:\s*24,\s*height:\s*44/);
  assert.match(egyptEnemies, /id:\s*'scorpion-start-1'[\s\S]*?width:\s*44[\s\S]*?height:\s*30[\s\S]*?attackPatternTuning:\s*\{[\s\S]*?windup:\s*0\.66[\s\S]*?duration:\s*0\.34[\s\S]*?range:\s*26[\s\S]*?height:\s*62[\s\S]*?yOffset:\s*-38[\s\S]*?backReach:\s*42[\s\S]*?damageScale:\s*1\.5[\s\S]*?protectedDuringWindup:\s*true/);
  assert.match(egyptEnemies, /id:\s*'scorpion-pottery-1'[\s\S]*?name:\s*'Pottery Scorpion'[\s\S]*?type:\s*'scorpion'[\s\S]*?protectsRouteId:\s*'desert-opening-shard-cache'/);
  assert.match(egyptEnemies, /id:\s*'scorpion-seal-path-1'[\s\S]*?name:\s*'Seal Warden Scorpion'[\s\S]*?type:\s*'scorpion'[\s\S]*?protectsRouteId:\s*'temple-approach-seal'/);
  assert.match(egyptEnemies, /id:\s*'scorpion-guardian-path-1'[\s\S]*?name:\s*'Guardian Path Scorpion'[\s\S]*?type:\s*'scorpion'[\s\S]*?x:\s*X\(2130\)/);
  assert.match(egyptEnemies, /id:\s*'sand-wisp-start-1'[\s\S]*?damage:\s*4[\s\S]*?attackPatternTuning:\s*\{[\s\S]*?vulnerableAfter:\s*0\.72/);
  assert.match(egyptEnemies, /id:\s*'snake-1'[\s\S]*?attackPatternTuning:\s*\{[\s\S]*?windup:\s*0\.68[\s\S]*?range:\s*48/);
  assert.match(journeyComponentSource, /Scarab face armor blocks frontal hits\. Let it charge past, then strike from behind\./);
  assert.match(journeyComponentSource, /Scorpion venom slows Asha\. If a scarab is nearby, its charge gets faster\./);
  assert.match(journeyComponentSource, /Warrior mummies guard the threshold\. Wait for the sweep, then counter\./);
  assert.match(journeyComponentSource, /Snake lunges from mid-range\. Watch the coil\./);
});

test('Phase 5A desert combat gives Scarab Scout and Seal Warden readable counter roles', () => {
  const egyptEnemies = extractExportedArray('ENEMIES');
  const scarabScout = getDataRowById(egyptEnemies, 'scarab-scout-1');
  const sealWarden = getDataRowById(egyptEnemies, 'scorpion-seal-path-1');

  assert.match(scarabScout, /name:\s*'Scarab Scout'/);
  assert.match(scarabScout, /encounterRole:\s*'basic timing scout'/);
  assert.match(scarabScout, /combatRole:\s*'basic timing enemy'/);
  assert.match(scarabScout, /pressureHint:\s*'Anubis\\'s scout patrols the temple approach\. The seal will not open while it remains\.'/);
  assert.match(scarabScout, /attackPatternTuning:\s*\{[\s\S]*?label:\s*'Scout Charge'[\s\S]*?windup:\s*0\.72[\s\S]*?duration:\s*0\.24[\s\S]*?recovery:\s*0\.82[\s\S]*?vulnerableAfter:\s*0\.9/);
  assert.doesNotMatch(scarabScout, /health:\s*[3-9]/);

  assert.match(sealWarden, /name:\s*'Seal Warden Scorpion'/);
  assert.match(sealWarden, /encounterRole:\s*'route guardian enemy'/);
  assert.match(sealWarden, /combatRole:\s*'route guardian enemy'/);
  assert.match(sealWarden, /Anubis\\'s warden protects the seal/);
  assert.match(sealWarden, /Blind strikes bounce off its guard; counter after the sting\./);
  assert.match(sealWarden, /attackPatternTuning:\s*\{[\s\S]*?label:\s*'Guarded Sting'[\s\S]*?windup:\s*0\.82[\s\S]*?duration:\s*0\.32[\s\S]*?recovery:\s*0\.9[\s\S]*?vulnerableAfter:\s*0\.98[\s\S]*?shieldDuringWindup:\s*true[\s\S]*?protectedDuringWindup:\s*true/);
  assert.doesNotMatch(sealWarden, /health:\s*[3-9]/);

  assert.match(journeyComponentSource, /protectedDuringWindup/);
  assert.match(journeyComponentSource, /attackWindup > 0 && pattern\.protectedDuringWindup/);
  assert.match(journeyComponentSource, /combatRole:\s*enemy\.combatRole \|\| enemy\.encounterRole \|\| null/);
  assert.match(journeyComponentSource, /attackTellActive:\s*entity\.attackWindup > 0/);
  assert.match(journeyComponentSource, /recoveryWindowActive:\s*entity\.attackRecovery > 0/);
  assert.match(journeyComponentSource, /counterWindowActive:\s*entity\.vulnerabilityTimer > 0 \|\| entity\.attackRecovery > 0/);
  assert.match(useJourneyRendererSource, /drawEnemyAttackTellFrame\(ctx, enemy/);
  assert.match(useJourneyRendererSource, /if \(boss \|\| enemy\.defeated\) return/);
  assert.match(journeyComponentSource, /pattern\.protectedDuringWindup/);
});

test('Phase 5B isolates the first Scarab Scout and Seal Warden teaching pockets', () => {
  const egyptEnemies = extractExportedArray('ENEMIES');
  const getRow = (id) => getDataRowById(egyptEnemies, id);
  const readAuthoredX = (row, field = 'x') => {
    const scaled = row.match(new RegExp(`${field}:\\s*X\\((\\d+)\\)`));
    if (scaled) return Number(scaled[1]);
    return Number(row.match(new RegExp(`${field}:\\s*(\\d+)`))?.[1] || Number.POSITIVE_INFINITY);
  };
  const readInitialCooldown = (row) => Number(row.match(/initialAttackCooldown:\s*(\d+(?:\.\d+)?)/)?.[1] || 0);

  const scarabScout = getRow('scarab-scout-1');
  const startWisp = getRow('sand-wisp-start-1');
  const regularScarab = getRow('scarab-1');
  const ledgeWisp = getRow('sand-wisp-ledge-1');
  const upperScarab = getRow('scarab-upper-route-1');
  const sealWarden = getRow('scorpion-seal-path-1');
  const warningScorpion = getRow('scorpion-warning-1');
  const sandSnake = getRow('snake-1');

  assert.ok(readAuthoredX(startWisp, 'patrolMin') >= readAuthoredX(scarabScout, 'patrolMax') + 60, 'Sand Wisp should not overlap the Scout patrol pocket');
  assert.ok(readAuthoredX(startWisp) - readAuthoredX(scarabScout) >= 120, 'Sand Wisp should sit far enough after the Scout to avoid becoming the primary lesson enemy');
  assert.ok(readInitialCooldown(startWisp) >= 2, 'Sand Wisp should wait before joining the Scout teaching moment');
  assert.ok(readInitialCooldown(regularScarab) >= 1.6, 'The next regular Scarab should not immediately stack on the Scout teaching moment');

  assert.ok(readAuthoredX(upperScarab) <= readAuthoredX(sealWarden) - 100, 'Upper Route Scarab should sit outside the Warden smoke pocket');
  assert.ok(readAuthoredX(ledgeWisp, 'patrolMax') <= readAuthoredX(sealWarden, 'patrolMin') - 60, 'Ledge Sand Wisp should not overlap the Warden patrol pocket');
  assert.ok(readAuthoredX(warningScorpion, 'patrolMin') >= readAuthoredX(sealWarden, 'patrolMax') + 80, 'Stone Scorpion should wait beyond the Warden patrol pocket');
  assert.ok(readAuthoredX(sandSnake, 'patrolMin') >= readAuthoredX(warningScorpion, 'patrolMax') + 40, 'Sand Snake should stay beyond the follow-up scorpion instead of stacking into the Warden lesson');
  [ledgeWisp, upperScarab, warningScorpion, sandSnake].forEach((row) => {
    assert.ok(readInitialCooldown(row) >= 1.8, `${row.match(/id:\s*'([^']+)'/)?.[1]} should delay its first attack near the Warden teaching pocket`);
  });

  assert.match(scarabScout, /attackPatternTuning:\s*\{[\s\S]*?label:\s*'Scout Charge'[\s\S]*?windup:\s*0\.72[\s\S]*?duration:\s*0\.24[\s\S]*?recovery:\s*0\.82[\s\S]*?vulnerableAfter:\s*0\.9/);
  assert.match(sealWarden, /attackPatternTuning:\s*\{[\s\S]*?label:\s*'Guarded Sting'[\s\S]*?windup:\s*0\.82[\s\S]*?duration:\s*0\.32[\s\S]*?recovery:\s*0\.9[\s\S]*?vulnerableAfter:\s*0\.98[\s\S]*?shieldDuringWindup:\s*true[\s\S]*?protectedDuringWindup:\s*true/);
});

test('endurance model slice 2: exhausted state, overwhelm rescue, trap floor, and recovery contracts', () => {
  // Enemy/boss hits use canOverwhelm option to allow below-zero rescue
  assert.match(journeyComponentSource, /canOverwhelm.*true[\s\S]{0,120}applyPlayerDamage|applyPlayerDamage[\s\S]{0,400}canOverwhelm:\s*true/);
  // applyPlayerDamage checks canOverwhelm before triggering rescue
  assert.match(journeyComponentSource, /options\.canOverwhelm[\s\S]{0,180}triggerJourneyRescue/);
  // Traps do NOT independently trigger rescue at zero (stop at zero, not overwhelm)
  assert.doesNotMatch(journeyComponentSource, /trapStaminaLoss[\s\S]{0,240}triggerJourneyRescue/);
  // Poison drain does NOT trigger rescue at zero (stops at zero)
  assert.doesNotMatch(journeyComponentSource, /poisonTickTimer[\s\S]{0,180}triggerJourneyRescue/);
  // Exhausted state tracked in initial state
  assert.match(journeyUtilsSource, /enduranceExhausted:\s*false/);
  // Dodge is blocked when exhausted (check appears inside queueDodge body)
  assert.match(journeyComponentSource, /queueDodge[\s\S]{0,700}enduranceExhausted/);
  // Finisher is blocked when exhausted (finisherAllowed derives from enduranceExhausted and gates the primed follow-up)
  assert.match(journeyComponentSource, /finisherAllowed\s*=\s*!current\.enduranceExhausted/);
  assert.match(journeyComponentSource, /heavyFollowupPrimed\s*=[\s\S]{0,200}finisherAllowed/);
  // Last-chance recovery constant exists
  assert.match(journeyComponentSource, /EXHAUSTED_RECOVERY_RATE\s*=/);
  // Recovery applies while exhausted
  assert.match(journeyComponentSource, /enduranceExhausted[\s\S]{0,160}EXHAUSTED_RECOVERY_RATE/);
  // Attack stamina cost floors at 0, not 1 (basic attacks still work when exhausted)
  assert.match(journeyComponentSource, /applyAttackStaminaCost[\s\S]{0,160}Math\.max\(0,/);
  // UI strings say Endurance not stamina in visible notices
  assert.match(journeyComponentSource, /Endurance\.|Endurance\s*\.\s*|-\$\{amount\} Endurance/);
  assert.doesNotMatch(journeyComponentSource, /-\$\{amount\} stamina\./);
  // Floating damage label says ENDURANCE
  assert.match(journeyComponentSource, /ENDURANCE/);
  assert.doesNotMatch(journeyComponentSource, /fillText\(`-\$\{player\.lastDamage\} STAMINA/);
});

test('jump contact only bounces enemies while attacks defeat them through weapon damage', () => {
  assert.match(journeyComponentSource, /const applyEnemyStomp = \(enemy\) => \{/);
  assert.doesNotMatch(journeyComponentSource, /const applyEnemyStomp = \(enemy\) => \{[\s\S]*?text:\s*'BOUNCE'/);
  assert.match(journeyComponentSource, /current\.notice = `\$\{enemy\.name\} bounced away\. Use J or K to defeat it\.`/);
  assert.doesNotMatch(journeyComponentSource, /const applyEnemyStomp = \(enemy\) => \{[\s\S]*?enemy\.health -= 1[\s\S]*?\};/);
  assert.doesNotMatch(journeyComponentSource, /const applyEnemyStomp = \(enemy\) => \{[\s\S]*?current\.defeatedEnemies\.add\(enemy\.id\)[\s\S]*?\};/);
  assert.match(journeyComponentSource, /if \(attackRect && !current\.attackHitIds\.has\(e\.id\) && rectsOverlap\(attackRect, getAttackHurtbox\(e\)\)\) \{[\s\S]*?e\.health -= isFinisher \? PLAYER_ATTACK_FINISHER_DAMAGE : \(isParry \? PLAYER_ATTACK_PARRY_DAMAGE : \(isHeavyAttack \? PLAYER_ATTACK_SHOVE_DAMAGE : PLAYER_ATTACK_LIGHT_DAMAGE\)\)/);
  assert.match(journeyUtilsSource, /if\s*\(enemy\.firstSealRouteRamp\)\s*\{[\s\S]*?const tunedHealth = Math\.max\(3, enemy\.health\) \* COMBAT_DAMAGE_SCALE/);
  assert.match(journeyUtilsSource, /const tunedHealth = clamp\(Math\.max\(enemy\.health \+ bonus, Math\.ceil\(enemy\.health \* 1\.55\)\), 3, 5\) \* COMBAT_DAMAGE_SCALE/);
  assert.match(journeyUtilsSource, /if \(enemy\.type === 'scorpion'\) return Math\.ceil\(tunedHealth \* 1\.5\)/);
});

test('detail props scale their rendered contact layer with the editor box', () => {
  assert.match(journeyComponentSource, /const getScaledDetailContactLayer = \(prop = \{\}, detailSize = \{\}\) => \{/);
  assert.match(journeyComponentSource, /widthRatio:\s*Number\.isFinite\(entry\.widthRatio\)\s*\?\s*entry\.widthRatio \* widthRatio\s*:\s*widthRatio/);
  assert.match(journeyComponentSource, /height:\s*Number\.isFinite\(entry\.height\)\s*\?\s*entry\.height \* heightRatio\s*:\s*detailSize\.height/);
  assert.match(journeyComponentSource, /const scaledDetailContactLayer = getScaledDetailContactLayer\(prop, detailSize\);/);
  assert.match(journeyComponentSource, /const width = detailSize\.width;/);
});
