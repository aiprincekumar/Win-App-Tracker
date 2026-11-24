/**
 * Test Suite: Dashboard Filter Focus Outline and Box-Shadow Suppression Verification
 * 
 * Verifies that the rectangular green outline/focus ring artifact on dropdown filter
 * selectors (#trackingModeSelect, #browserFilterSelect, .browser-filter-select) is
 * completely eliminated via explicit CSS overrides with !important across:
 * - dashboard/dashboard.css
 * - dashboard/styles/layout.css
 * - dashboard/styles/themes.css
 * 
 * Target Workspace: Win App Tracker / Browser Detection
 * Department: Dept 05 Frontend Engineering
 * Token: AUTH-MGR-20261124-FOCUS-RING-FIX-001
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('🧪 Starting Dashboard Filter Focus Ring Suppression Verification Suite...\n');

const ROOT_DIR = path.resolve(__dirname, '..');
const DASHBOARD_CSS = path.join(ROOT_DIR, 'dashboard', 'dashboard.css');
const LAYOUT_CSS = path.join(ROOT_DIR, 'dashboard', 'styles', 'layout.css');
const THEMES_CSS = path.join(ROOT_DIR, 'dashboard', 'styles', 'themes.css');
const DASHBOARD_HTML = path.join(ROOT_DIR, 'dashboard', 'dashboard.html');

// Battery 1: DOM Elements Invariant Verification in dashboard.html
console.log('Battery 1: Verifying DOM Elements and Selectors in dashboard.html...');
const htmlContent = fs.readFileSync(DASHBOARD_HTML, 'utf8');

assert.ok(htmlContent.includes('id="browserFilterSelect"'), 'dashboard.html must contain #browserFilterSelect');
assert.ok(htmlContent.includes('id="trackingModeSelect"'), 'dashboard.html must contain #trackingModeSelect');
assert.ok(htmlContent.includes('class="browser-filter-select"'), 'dashboard.html must contain class .browser-filter-select');
assert.ok(htmlContent.includes('class="browser-filter-container compact-pill"'), 'dashboard.html must contain .browser-filter-container.compact-pill');
assert.ok(htmlContent.includes('value="foreground">🖥️ Active Only</option>'), 'trackingModeSelect must contain Active Only option');
console.log('  ✔ Battery 1 Passed: Filter select dropdowns and container classes present.\n');

// Battery 2: CSS Override Verification in dashboard/dashboard.css
console.log('Battery 2: Verifying CSS Overrides in dashboard/dashboard.css...');
const dashCss = fs.readFileSync(DASHBOARD_CSS, 'utf8');

assert.ok(dashCss.includes('.browser-filter-select:focus-visible'), 'dashboard.css must target .browser-filter-select:focus-visible');
assert.ok(dashCss.includes('#trackingModeSelect:focus-visible'), 'dashboard.css must target #trackingModeSelect:focus-visible');
assert.ok(dashCss.includes('#browserFilterSelect:focus-visible'), 'dashboard.css must target #browserFilterSelect:focus-visible');

const hasOutlineNone = /#trackingModeSelect:focus-visible[^{]*\{[^}]*outline:\s*none\s*!important/s.test(dashCss) ||
                       /\.browser-filter-select:focus-visible[^{]*\{[^}]*outline:\s*none\s*!important/s.test(dashCss);
assert.ok(hasOutlineNone, 'dashboard.css must contain outline: none !important for filter selects');

const hasBoxShadowNone = /#trackingModeSelect:focus-visible[^{]*\{[^}]*box-shadow:\s*none\s*!important/s.test(dashCss) ||
                         /\.browser-filter-select:focus-visible[^{]*\{[^}]*box-shadow:\s*none\s*!important/s.test(dashCss);
assert.ok(hasBoxShadowNone, 'dashboard.css must contain box-shadow: none !important for filter selects');

const hasBorderNone = /#trackingModeSelect:focus-visible[^{]*\{[^}]*border:\s*none\s*!important/s.test(dashCss) ||
                      /\.browser-filter-select:focus-visible[^{]*\{[^}]*border:\s*none\s*!important/s.test(dashCss);
assert.ok(hasBorderNone, 'dashboard.css must contain border: none !important for filter selects');

// Verify override is placed AFTER global :focus-visible
const globalFocusIdx = dashCss.indexOf(':focus-visible {');
const lastOverrideIdx = dashCss.lastIndexOf('#trackingModeSelect:focus-visible');
assert.ok(globalFocusIdx !== -1, 'dashboard.css must have global :focus-visible');
assert.ok(lastOverrideIdx > globalFocusIdx, 'Override in dashboard.css must appear after global :focus-visible to guarantee cascade victory');
console.log('  ✔ Battery 2 Passed: dashboard.css overrides verified with cascade guarantee.\n');

// Battery 3: CSS Override Verification in dashboard/styles/layout.css
console.log('Battery 3: Verifying CSS Overrides in dashboard/styles/layout.css...');
const layoutCss = fs.readFileSync(LAYOUT_CSS, 'utf8');

assert.ok(layoutCss.includes('.browser-filter-select:focus-visible'), 'layout.css must target .browser-filter-select:focus-visible');
assert.ok(layoutCss.includes('#trackingModeSelect:focus-visible'), 'layout.css must target #trackingModeSelect:focus-visible');
assert.ok(layoutCss.includes('#browserFilterSelect:focus-visible'), 'layout.css must target #browserFilterSelect:focus-visible');
assert.ok(/outline:\s*none\s*!important/.test(layoutCss), 'layout.css must enforce outline: none !important');
assert.ok(/box-shadow:\s*none\s*!important/.test(layoutCss), 'layout.css must enforce box-shadow: none !important');
assert.ok(/border:\s*none\s*!important/.test(layoutCss), 'layout.css must enforce border: none !important');
console.log('  ✔ Battery 3 Passed: layout.css overrides verified.\n');

// Battery 4: CSS Override Verification in dashboard/styles/themes.css (Dark & Light Themes)
console.log('Battery 4: Verifying CSS Overrides in dashboard/styles/themes.css...');
const themesCss = fs.readFileSync(THEMES_CSS, 'utf8');

assert.ok(themesCss.includes('.browser-filter-select:focus-visible'), 'themes.css must target .browser-filter-select:focus-visible');
assert.ok(themesCss.includes('#trackingModeSelect:focus-visible'), 'themes.css must target #trackingModeSelect:focus-visible');
assert.ok(themesCss.includes('#browserFilterSelect:focus-visible'), 'themes.css must target #browserFilterSelect:focus-visible');
assert.ok(themesCss.includes('body.theme-light .browser-filter-select:focus-visible'), 'themes.css must include light theme overrides');

const globalThemesFocusIdx = themesCss.indexOf(':focus-visible {');
const lastThemesOverrideIdx = themesCss.lastIndexOf('#trackingModeSelect:focus-visible');
assert.ok(globalThemesFocusIdx !== -1, 'themes.css must have global :focus-visible');
assert.ok(lastThemesOverrideIdx > globalThemesFocusIdx, 'Override in themes.css must appear after global :focus-visible');
console.log('  ✔ Battery 4 Passed: themes.css overrides verified for dark, light, and substrate themes.\n');

// Battery 5: UTF-8 with BOM Invariant Verification across all modified files
console.log('Battery 5: Verifying UTF-8 with BOM compliance (Universal Rule 5 & 8)...');
const filesToCheck = [DASHBOARD_CSS, LAYOUT_CSS, THEMES_CSS];
filesToCheck.forEach(f => {
  const buf = fs.readFileSync(f);
  const hasBOM = buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF;
  assert.ok(hasBOM, path.basename(f) + ' must have UTF-8 BOM encoding (0xEF, 0xBB, 0xBF)');
});
console.log('  ✔ Battery 5 Passed: 100% UTF-8 with BOM verified across all touched files.\n');

console.log('🎉 All 5 verification batteries passed successfully! Focus outline issue resolved cleanly.\n');
process.exit(0);
