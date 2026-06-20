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
  assert.match(drawerCss, /\.journey-prop-palette-panel\s*\{[^}]*box-sizing:\s*border-box;[^}]*width:\s*auto;[^}]*max-height:\s*min\(6\.3rem, calc\(100% - 1\.44rem\)\);/);
  assert.match(drawerCss, /\.journey-prop-palette-browser\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\);/);
  assert.match(drawerCss, /\.journey-prop-palette-category-rail\s*\{[^}]*display:\s*flex;[^}]*overflow-x:\s*auto;[^}]*border-bottom:/);
  assert.match(drawerCss, /\.journey-prop-palette-grid\s*\{[^}]*grid-auto-columns:\s*minmax\(5\.65rem, 6\.7rem\);[^}]*grid-auto-flow:\s*column;/);
  assert.match(drawerCss, /\.journey-prop-palette-list\s*\{[^}]*max-height:\s*2\.74rem;[^}]*overflow-x:\s*auto;[^}]*overflow-y:\s*hidden;/);
  assert.match(drawerCss, /\.journey-prop-palette-recent\s*\{[^}]*display:\s*none;/);
  assert.match(drawerCss, /\.journey-prop-palette-copy span\s*\{[^}]*display:\s*none;/);
  assert.match(drawerCss, /\.journey-prop-palette-list \.journey-prop-palette-group-toggle\s*\{[^}]*display:\s*none;/);
});
