import { readFileSync, existsSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const mainSource = readFileSync(new URL('../main.jsx', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../App.jsx', import.meta.url), 'utf8');
const indexCss = readFileSync(new URL('../index.css', import.meta.url), 'utf8');
const digPhaseCssUrl = new URL('./dig-phase.css', import.meta.url);
const printCssUrl = new URL('./print.css', import.meta.url);
const reportPhaseCssUrl = new URL('./report-phase.css', import.meta.url);
const devToolsCssUrl = new URL('./dev-tools.css', import.meta.url);
const museumExportCssUrl = new URL('./museum-export.css', import.meta.url);
const bureauTextureCssUrl = new URL('./bureau-texture.css', import.meta.url);
const bureauCaseFileStatusCssUrl = new URL('./bureau-case-file-status.css', import.meta.url);
const basecampChecklistCssUrl = new URL('./basecamp-checklist.css', import.meta.url);
const photoCornersCssUrl = new URL('./photo-corners.css', import.meta.url);
const labPhaseCssUrl = new URL('./lab-phase.css', import.meta.url);
const mainCanvasCssUrl = new URL('./main-canvas.css', import.meta.url);
const lostSiteExpeditionCssUrl = new URL('./lost-site-expedition.css', import.meta.url);
const decorativeDeskPropsCssUrl = new URL('./decorative-desk-props.css', import.meta.url);
const journeyPropPaletteDrawerCssUrl = new URL('./journey-prop-palette-drawer.css', import.meta.url);

test('dig phase polish styles live in their own imported stylesheet', () => {
  assert.match(
    mainSource,
    /import\s+['"]\.\/styles\/dig-phase\.css['"]/,
    'main.jsx should import the extracted dig phase stylesheet after index.css',
  );
  assert.equal(existsSync(digPhaseCssUrl), true, 'dig-phase.css should exist');
  assert.equal(
    indexCss.includes('Premium game HUD pass: Phase 1 Emergency Excavation'),
    false,
    'the extracted dig phase section should not remain in index.css',
  );
});

test('print-only styles live in their own imported stylesheet', () => {
  assert.match(
    mainSource,
    /import\s+['"]\.\/styles\/print\.css['"]/,
    'main.jsx should import the extracted print stylesheet after index.css',
  );
  assert.equal(existsSync(printCssUrl), true, 'print.css should exist');
  assert.equal(indexCss.includes('@media print'), false, 'print media blocks should not remain in index.css');
});

test('global styles are imported once from the app entry', () => {
  assert.match(mainSource, /import\s+['"]\.\/index\.css['"]/);
  assert.doesNotMatch(appSource, /import\s+['"]\.\/index\.css['"]/);
});

test('removed museum and clue panel placeholders do not linger in index.css', () => {
  [
    'Block removed',
    'Consolidated above',
    'Removed .museum-curation-main',
    'Legacy Inventory Tray',
    'Legacy Clue Panel',
    '.inventory-tray',
    '.clue-panel',
    '.clue-main-content',
    '.clue-content',
    'Redundant styles removed',
  ].forEach((oldMarker) => {
    assert.equal(indexCss.includes(oldMarker), false, `${oldMarker} should not remain in index.css`);
  });
});

test('report phase base styles live in their own imported stylesheet', () => {
  assert.match(
    mainSource,
    /import\s+['"]\.\/styles\/report-phase\.css['"]/,
    'main.jsx should import the extracted report phase stylesheet after index.css',
  );
  assert.equal(existsSync(reportPhaseCssUrl), true, 'report-phase.css should exist');
  assert.equal(indexCss.includes('/* Report Phase */'), false, 'base report phase section should not remain in index.css');
  assert.equal(indexCss.includes('.report-container {'), false, 'base report container selector should not remain in index.css');
});

test('dev tools overlay styles live in their own imported stylesheet', () => {
  assert.match(
    mainSource,
    /import\s+['"]\.\/styles\/dev-tools\.css['"]/,
    'main.jsx should import the extracted dev tools stylesheet after index.css',
  );
  assert.equal(existsSync(devToolsCssUrl), true, 'dev-tools.css should exist');
  assert.equal(indexCss.includes('Dev Tools Overlay'), false, 'dev tools section should not remain in index.css');
  assert.doesNotMatch(indexCss, /^\.dev-tools\s*\{/m, 'standalone dev tools panel selector should not remain in index.css');
  assert.equal(indexCss.includes('.dev-tools-label'), false, 'dev tools label selector should not remain in index.css');
});

test('museum export and field evidence styles live in their own imported stylesheet', () => {
  assert.match(
    mainSource,
    /import\s+['"]\.\/styles\/museum-export\.css['"]/,
    'main.jsx should import the extracted museum export stylesheet after index.css',
  );
  assert.equal(existsSync(museumExportCssUrl), true, 'museum-export.css should exist');
  assert.equal(indexCss.includes('/* Museum Export Styles */'), false, 'museum export section should not remain in index.css');
  assert.equal(indexCss.includes('/* Field Evidence List */'), false, 'field evidence section should not remain in index.css');
  assert.equal(indexCss.includes('/* Print Buttons */'), false, 'print button section should not remain in index.css');
});

test('bureau paper texture styles live in their own imported stylesheet', () => {
  assert.match(
    mainSource,
    /import\s+['"]\.\/styles\/bureau-texture\.css['"]/,
    'main.jsx should import the extracted bureau texture stylesheet after index.css',
  );
  assert.equal(existsSync(bureauTextureCssUrl), true, 'bureau-texture.css should exist');
  assert.equal(indexCss.includes('/* Texture & Polish */'), false, 'bureau texture section should not remain in index.css');
  assert.equal(indexCss.includes('.bureau-paper-texture {'), false, 'bureau paper texture selector should not remain in index.css');
});

test('bureau case file status and clue reveal styles live in their own imported stylesheet', () => {
  assert.match(
    mainSource,
    /import\s+['"]\.\/styles\/bureau-case-file-status\.css['"]/,
    'main.jsx should import the extracted bureau case file status stylesheet after index.css',
  );
  assert.equal(existsSync(bureauCaseFileStatusCssUrl), true, 'bureau-case-file-status.css should exist');
  assert.equal(indexCss.includes('.bureau-tier-status {'), false, 'bureau tier status selector should not remain in index.css');
  assert.equal(indexCss.includes('.bureau-tier-indicator {'), false, 'bureau tier indicator selector should not remain in index.css');
  assert.equal(indexCss.includes('.clue-reveal-container {'), false, 'clue reveal selector should not remain in index.css');
});

test('base camp checklist and shop polish styles live in their own imported stylesheet', () => {
  assert.match(
    mainSource,
    /import\s+['"]\.\/styles\/basecamp-checklist\.css['"]/,
    'main.jsx should import the extracted base camp checklist stylesheet after index.css',
  );
  assert.equal(existsSync(basecampChecklistCssUrl), true, 'basecamp-checklist.css should exist');
  assert.equal(indexCss.includes('/* --- BASE CAMP CHECKLIST POLISH --- */'), false, 'base camp checklist marker should not remain in index.css');
  assert.equal(indexCss.includes('.expedition-basecamp-shell {'), false, 'base camp shell selector should not remain in index.css');
  assert.equal(indexCss.includes('.basecamp-shop-summary {'), false, 'base camp shop summary selector should not remain in index.css');
  assert.equal(indexCss.includes('.basecamp-shop-grid {'), false, 'base camp shop grid selector should not remain in index.css');
});

test('photo corners training polish styles live in their own imported stylesheet', () => {
  assert.match(
    mainSource,
    /import\s+['"]\.\/styles\/photo-corners\.css['"]/,
    'main.jsx should import the extracted photo corners stylesheet after index.css',
  );
  assert.equal(existsSync(photoCornersCssUrl), true, 'photo-corners.css should exist');
  assert.equal(indexCss.includes('/* Photo corners */'), false, 'photo corners marker should not remain in index.css');
  assert.equal(indexCss.includes('.vintage-panel::after,'), false, 'photo corner pseudo-element selector should not remain in index.css');
  assert.equal(indexCss.includes('.historical-context-box::before'), false, 'historical context decoration from this section should not remain in index.css');
});

test('phase 3 lab styles live in their own imported stylesheet', () => {
  assert.match(
    mainSource,
    /import\s+['"]\.\/styles\/lab-phase\.css['"]/,
    'main.jsx should import the extracted lab phase stylesheet after index.css',
  );
  assert.equal(existsSync(labPhaseCssUrl), true, 'lab-phase.css should exist');
  assert.equal(indexCss.includes('/* Phase 3: Lab */'), false, 'phase 3 lab marker should not remain in index.css');
  assert.equal(
    indexCss.includes('/* Full Investigation Lab phase compact dossier workspace */'),
    false,
    'full investigation lab workspace marker should not remain in index.css',
  );
  assert.equal(indexCss.includes('.lab-briefing-card {'), false, 'lab briefing card selector should not remain in index.css');
});

test('main canvas area styles live in their own imported stylesheet', () => {
  assert.match(
    mainSource,
    /import\s+['"]\.\/styles\/main-canvas\.css['"]/,
    'main.jsx should import the extracted main canvas stylesheet after index.css',
  );
  assert.equal(existsSync(mainCanvasCssUrl), true, 'main-canvas.css should exist');
  assert.equal(indexCss.includes('/* Main Canvas Area */'), false, 'main canvas marker should not remain in index.css');
  assert.equal(indexCss.includes('.canvas-wrapper {'), false, 'canvas wrapper selector should not remain in index.css');
  assert.doesNotMatch(indexCss, /^\.world-map-image-stage\s*\{/m, 'standalone world map image stage selector should not remain in index.css');
});

test('lost site expedition shell styles live in their own imported stylesheet', () => {
  assert.match(
    mainSource,
    /import\s+['"]\.\/styles\/lost-site-expedition\.css['"]/,
    'main.jsx should import the extracted lost site expedition stylesheet after index.css',
  );
  assert.equal(existsSync(lostSiteExpeditionCssUrl), true, 'lost-site-expedition.css should exist');
  assert.equal(indexCss.includes('/* Lost Site Expedition */'), false, 'lost site expedition marker should not remain in index.css');
  assert.equal(indexCss.includes('.expedition-shell {'), false, 'expedition shell selector should not remain in index.css');
  assert.equal(indexCss.includes('.expedition-topbar {'), false, 'expedition topbar selector should not remain in index.css');
});

test('decorative desk prop styles live in their own imported stylesheet', () => {
  assert.match(
    mainSource,
    /import\s+['"]\.\/styles\/decorative-desk-props\.css['"]/,
    'main.jsx should import the extracted decorative desk props stylesheet after index.css',
  );
  assert.equal(existsSync(decorativeDeskPropsCssUrl), true, 'decorative-desk-props.css should exist');
  assert.equal(indexCss.includes('/* ---- Decorative desk props ---- */'), false, 'decorative desk props marker should not remain in index.css');
  assert.equal(indexCss.includes('.training-table-prop {'), false, 'training table prop selector should not remain in index.css');
  assert.equal(indexCss.includes('.training-desk-scene {'), false, 'training desk scene selector should not remain in index.css');
});

test('journey prop palette drawer override stays isolated and imported after the main stylesheet', () => {
  const drawerCss = readFileSync(journeyPropPaletteDrawerCssUrl, 'utf8');
  const indexImport = mainSource.indexOf("import './index.css'");
  const drawerImport = mainSource.indexOf("import './styles/journey-prop-palette-drawer.css'");
  const appImport = mainSource.indexOf("import App from './App.jsx'");

  assert.notEqual(indexImport, -1, 'main.jsx should import index.css');
  assert.notEqual(drawerImport, -1, 'main.jsx should import the prop palette drawer stylesheet');
  assert.ok(drawerImport > indexImport, 'the drawer stylesheet should load after index.css so it overrides old palette rules');
  assert.ok(drawerImport < appImport, 'the drawer stylesheet should load before the app renders');
  assert.equal(existsSync(journeyPropPaletteDrawerCssUrl), true, 'journey-prop-palette-drawer.css should exist');
  assert.match(drawerCss, /\.journey-prop-palette-panel\s*\{[^}]*top:\s*auto;[^}]*left:\s*0\.72rem;[^}]*right:\s*0\.72rem;[^}]*bottom:\s*0\.72rem;/);
  assert.match(drawerCss, /\.journey-prop-palette-panel\s*\{[^}]*box-sizing:\s*border-box;[^}]*width:\s*auto;[^}]*max-height:\s*min\(9\.45rem, calc\(100% - 1\.44rem\)\);/);
  assert.match(drawerCss, /\.journey-prop-palette-browser\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\);/);
  assert.match(drawerCss, /\.journey-prop-palette-category-rail\s*\{[^}]*display:\s*flex;[^}]*overflow-x:\s*auto;[^}]*border-bottom:/);
  assert.match(drawerCss, /\.journey-prop-palette-grid\s*\{[^}]*grid-auto-columns:\s*minmax\(5\.65rem, 6\.7rem\);[^}]*grid-auto-flow:\s*column;[^}]*grid-template-rows:\s*repeat\(2, minmax\(2\.65rem, 1fr\)\);/);
  assert.match(drawerCss, /\.journey-prop-palette-list\s*\{[^}]*max-height:\s*5\.7rem;[^}]*overflow-x:\s*auto;[^}]*overflow-y:\s*hidden;/);
  assert.match(drawerCss, /\.journey-prop-palette-recent\s*\{[^}]*display:\s*none;/);
  assert.match(drawerCss, /\.journey-prop-palette-copy span\s*\{[^}]*display:\s*none;/);
  assert.match(drawerCss, /\.journey-prop-palette-list \.journey-prop-palette-group-toggle\s*\{[^}]*display:\s*none;/);
});
