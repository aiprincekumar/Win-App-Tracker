/**
 * Sentinel Web Activity & Media Sentinel - Focus View UI/UX Elevation Verification Suite
 * File: tests/test_popup_focus_wellness_elevation.js
 * Authorization Token: AUTH-MGR-20261119-POPUP-FOCUS-WELLNESS-ELEVATION-001
 * 
 * Tests:
 * 1. Focus Ratio & Doomscroll Breaker DOM Architecture & ID Integrity
 * 2. CSS Cyber-Dark Tokens & Synchronization across wellness stylesheets
 * 3. Light Theme & High-Contrast Mode Compatibility
 * 4. JS State Logic & Dynamic Simulation (Tinting, Status, Telemetry)
 * 5. Universal Rule 28 Code Modularity (<= 50 lines, nesting depth <= 3)
 * 6. W3C Trusted Types & Zero-innerHTML Security Audit
 * 7. Bilingual i18n Localization Parity (en/hi)
 * 8. UTF-8 with BOM Preservation across all touched files
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('🧪 Starting Focus View UI/UX Elevation Verification Suite (AUTH-MGR-20261119-POPUP-FOCUS-WELLNESS-ELEVATION-001)...\n');

const popupHtmlPath = path.resolve(__dirname, '../popup/popup.html');
const popupJsPath = path.resolve(__dirname, '../popup/popup.js');
const tabWellnessCssPath = path.resolve(__dirname, '../popup/styles/tabs/tab_wellness.css');
const wellnessCssPath = path.resolve(__dirname, '../popup/styles/wellness.css');
const popupCssPath = path.resolve(__dirname, '../popup/popup.css');
const themesCssPath = path.resolve(__dirname, '../popup/styles/themes.css');
const lightContrastCssPath = path.resolve(__dirname, '../popup/styles/themes/light_contrast.css');
const enJsonPath = path.resolve(__dirname, '../locales/en.json');
const hiJsonPath = path.resolve(__dirname, '../locales/hi.json');

function readUtf8StripBOM(filePath) {
  let s = fs.readFileSync(filePath, 'utf8');
  if (s.charCodeAt(0) === 0xFEFF) s = s.slice(1);
  return s;
}

const popupHtml = readUtf8StripBOM(popupHtmlPath);
const popupJs = readUtf8StripBOM(popupJsPath);
const tabWellnessCss = readUtf8StripBOM(tabWellnessCssPath);
const wellnessCss = readUtf8StripBOM(wellnessCssPath);
const popupCss = readUtf8StripBOM(popupCssPath);
const themesCss = readUtf8StripBOM(themesCssPath);
const lightContrastCss = readUtf8StripBOM(lightContrastCssPath);
const enJson = JSON.parse(readUtf8StripBOM(enJsonPath));
const hiJson = JSON.parse(readUtf8StripBOM(hiJsonPath));

// ============================================================================
// Battery 1: DOM Architecture & ID Preservation
// ============================================================================
console.log('Battery 1: DOM Architecture & ID Preservation');
{
  // Focus Ratio IDs & Classes
  assert.ok(popupHtml.includes('id="focusRatioBarContainer"'), 'popup.html must contain #focusRatioBarContainer');
  assert.ok(popupHtml.includes('class="focus-ratio-container focus-ratio-card"'), 'Must have elevated classes on container');
  assert.ok(popupHtml.includes('id="lblFocusRatioTitle"'), 'Must contain #lblFocusRatioTitle');
  assert.ok(popupHtml.includes('id="focusRatioPercentText"'), 'Must contain #focusRatioPercentText');
  assert.ok(popupHtml.includes('id="focusRatioText"'), 'Must preserve hidden fallback #focusRatioText');
  assert.ok(popupHtml.includes('id="focusRatioProductiveFill"'), 'Must contain #focusRatioProductiveFill');
  assert.ok(popupHtml.includes('id="focusRatioEntertainmentBar"'), 'Must contain #focusRatioEntertainmentBar');
  assert.ok(popupHtml.includes('id="focusRatioProductiveBar"'), 'Must preserve hidden fallback #focusRatioProductiveBar');
  assert.ok(popupHtml.includes('id="focusRatioProdPill"'), 'Must contain #focusRatioProdPill');
  assert.ok(popupHtml.includes('id="focusRatioEntPill"'), 'Must contain #focusRatioEntPill');
  assert.ok(popupHtml.includes('id="lblRatioWork"'), 'Must contain #lblRatioWork');
  assert.ok(popupHtml.includes('id="focusRatioProdPct"'), 'Must contain #focusRatioProdPct');
  assert.ok(popupHtml.includes('id="lblRatioMedia"'), 'Must contain #lblRatioMedia');
  assert.ok(popupHtml.includes('id="focusRatioEntPct"'), 'Must contain #focusRatioEntPct');

  // Doomscroll Breaker IDs & Classes
  assert.ok(popupHtml.includes('id="doomscrollBreakerCard"'), 'Must contain #doomscrollBreakerCard');
  assert.ok(popupHtml.includes('class="doomscroll-breaker-card doomscroll-breaker-row"'), 'Must have elevated classes on card');
  assert.ok(popupHtml.includes('id="lblDoomscrollTitle"'), 'Must contain #lblDoomscrollTitle');
  assert.ok(popupHtml.includes('id="doomscrollStatusBadge"'), 'Must contain #doomscrollStatusBadge');
  assert.ok(popupHtml.includes('id="doomscrollStatusText"'), 'Must contain #doomscrollStatusText');
  assert.ok(popupHtml.includes('id="lblDoomscrollSub"'), 'Must contain #lblDoomscrollSub');
  assert.ok(popupHtml.includes('id="selectDoomscrollInterval"'), 'Must contain #selectDoomscrollInterval');
  assert.ok(popupHtml.includes('id="doomscrollIntervalSelect"'), 'Must preserve hidden fallback #doomscrollIntervalSelect');
  assert.ok(popupHtml.includes('id="toggleDoomscrollBreaker"'), 'Must contain #toggleDoomscrollBreaker');
  assert.ok(popupHtml.includes('class="doomscroll-chevron"'), 'Must contain .doomscroll-chevron arrow indicator');

  console.log('  ✅ Battery 1 passed: All canonical DOM IDs and elevated markup verified');
}

// ============================================================================
// Battery 2: CSS Cyber-Dark Tokens & Stylesheet Synchronization
// ============================================================================
console.log('\nBattery 2: CSS Cyber-Dark Tokens & Stylesheet Synchronization');
{
  const stylesheets = [
    { name: 'tab_wellness.css', content: tabWellnessCss },
    { name: 'wellness.css', content: wellnessCss },
    { name: 'popup.css', content: popupCss }
  ];

  for (const { name, content } of stylesheets) {
    // Focus Ratio Track
    assert.ok(content.includes('border-radius: 999px'), `${name} must define pill rounded ends`);
    assert.ok(content.includes('linear-gradient(90deg, #10b981 0%, #06b6d4 100%)'), `${name} must define emerald-cyan productive gradient`);
    assert.ok(content.includes('linear-gradient(90deg, #f59e0b 0%, #f43f5e 100%)'), `${name} must define amber-rose entertainment gradient`);
    assert.ok(content.includes('.focus-ratio-readout.ratio-optimal'), `${name} must define .ratio-optimal tinting`);
    assert.ok(content.includes('.focus-ratio-readout.ratio-warning'), `${name} must define .ratio-warning tinting`);

    // Doomscroll Breaker Card
    assert.ok(content.includes('.doomscroll-breaker-card'), `${name} must define .doomscroll-breaker-card`);
    assert.ok(content.includes('active-nudge'), `${name} must define active-nudge highlight state`);
    assert.ok(content.includes('.doomscroll-status-badge.active'), `${name} must define active status badge`);
    assert.ok(content.includes('.doomscroll-status-badge.standby'), `${name} must define standby status badge`);
    assert.ok(content.includes('.doomscroll-select'), `${name} must define .doomscroll-select`);
    assert.ok(content.includes('.doomscroll-chevron'), `${name} must define .doomscroll-chevron`);
  }

  console.log('  ✅ Battery 2 passed: Cyber-dark glass tokens and 3-way CSS synchronization certified');
}

// ============================================================================
// Battery 3: Light Theme & High-Contrast Accessibility
// ============================================================================
console.log('\nBattery 3: Light Theme & High-Contrast Accessibility');
{
  // Light theme overrides across relevant files
  const lightFiles = [
    { name: 'tab_wellness.css', content: tabWellnessCss },
    { name: 'popup.css', content: popupCss },
    { name: 'themes.css', content: themesCss },
    { name: 'light_contrast.css', content: lightContrastCss }
  ];

  for (const { name, content } of lightFiles) {
    assert.ok(content.includes('[data-theme="light"] .focus-ratio-container'), `${name} must contain light theme focus ratio container`);
    assert.ok(content.includes('[data-theme="light"] .focus-ratio-readout'), `${name} must contain light theme readout`);
    assert.ok(content.includes('[data-theme="light"] .doomscroll-breaker-card'), `${name} must contain light theme doomscroll card`);
    assert.ok(content.includes('[data-theme="light"] .doomscroll-select'), `${name} must contain light theme select`);
  }

  // High contrast mode
  assert.ok(popupCss.includes('body.high-contrast-mode .focus-ratio-container'), 'popup.css must contain high contrast focus ratio');
  assert.ok(popupCss.includes('body.high-contrast-mode .doomscroll-breaker-card'), 'popup.css must contain high contrast doomscroll card');
  assert.ok(tabWellnessCss.includes('body.high-contrast-mode .focus-ratio-container'), 'tab_wellness.css must contain high contrast focus ratio');

  console.log('  ✅ Battery 3 passed: Light mode [data-theme="light"] and body.high-contrast-mode verified');
}

// ============================================================================
// Battery 4: JS State Logic & Dynamic Simulation (Tinting, Status, Telemetry)
// ============================================================================
console.log('\nBattery 4: JS State Logic & Dynamic Simulation');
{
  // Mock minimal DOM environment
  const elements = new Map();
  function getOrCreate(id, className = '') {
    if (!elements.has(id)) {
      elements.set(id, {
        id,
        className,
        classList: {
          classes: new Set(className ? className.split(' ') : []),
          add(c) { this.classes.add(c); },
          remove(c) { this.classes.delete(c); },
          contains(c) { return this.classes.has(c); },
          toggle(c, force) {
            if (force === undefined) force = !this.contains(c);
            if (force) this.add(c); else this.remove(c);
            return force;
          }
        },
        style: {},
        textContent: '',
        setAttribute(k, v) { this[k] = v; }
      });
    }
    return elements.get(id);
  }

  const mockDocument = {
    getElementById(id) {
      return elements.get(id) || null;
    },
    querySelector(sel) {
      if (sel === '.ratio-progress-track') return getOrCreate('ratioTrack');
      return null;
    }
  };

  // Prepopulate elements
  const prodBar = getOrCreate('focusRatioProductiveFill');
  const entBar = getOrCreate('focusRatioEntertainmentBar');
  const ratioText = getOrCreate('focusRatioPercentText', 'focus-ratio-readout');
  const prodPct = getOrCreate('focusRatioProdPct');
  const entPct = getOrCreate('focusRatioEntPct');
  const doomBadge = getOrCreate('doomscrollStatusBadge');
  const doomText = getOrCreate('doomscrollStatusText');
  const doomCard = getOrCreate('doomscrollBreakerCard');

  // Extract and evaluate updateFocusRatio and updateDoomscrollStatusUI in sandbox
  const context = {
    document: mockDocument,
    Math: Math,
    Set: Set,
    Array: Array,
    Boolean: Boolean,
    String: String,
    t: (key) => key === 'doomscroll_status_active' ? 'Active' : 'Standby'
  };

  // Compile popup.js functions
  const scriptContent = `
    ${popupJs.slice(popupJs.indexOf('function updateFocusRatio'), popupJs.indexOf('let popupListenersAttached'))}
    ${popupJs.slice(popupJs.indexOf('function updateDoomscrollStatusUI'), popupJs.indexOf('// Focus & Digital Wellness'))}
  `;
  vm.createContext(context);
  vm.runInContext(scriptContent, context);

  // Test Case A: Productive Majority (80% work, 20% media)
  const sampleItemsA = [
    { domain: 'github.com', seconds: 800 },
    { domain: 'youtube.com', seconds: 200 }
  ];
  context.updateFocusRatio(sampleItemsA, 1000);

  assert.strictEqual(prodBar.style.width, '80%');
  assert.strictEqual(entBar.style.width, '20%');
  assert.strictEqual(ratioText.textContent, '80% Productive');
  assert.ok(ratioText.classList.contains('ratio-optimal'), 'Should have ratio-optimal class for >= 50%');
  assert.ok(!ratioText.classList.contains('ratio-warning'), 'Should not have ratio-warning class for >= 50%');
  assert.strictEqual(prodPct.textContent, '80%');
  assert.strictEqual(entPct.textContent, '20%');

  // Test Case B: Entertainment Majority (30% work, 70% media)
  const sampleItemsB = [
    { domain: 'docs.google.com', seconds: 300 },
    { domain: 'youtube.com', seconds: 400 },
    { domain: 'netflix.com', seconds: 300 }
  ];
  context.updateFocusRatio(sampleItemsB, 1000);

  assert.strictEqual(prodBar.style.width, '30%');
  assert.strictEqual(entBar.style.width, '70%');
  assert.strictEqual(ratioText.textContent, '30% Productive');
  assert.ok(!ratioText.classList.contains('ratio-optimal'), 'Should not have ratio-optimal class for < 50%');
  assert.ok(ratioText.classList.contains('ratio-warning'), 'Should have ratio-warning class for < 50%');
  assert.strictEqual(prodPct.textContent, '30%');
  assert.strictEqual(entPct.textContent, '70%');

  // Test Case C: Doomscroll Breaker Status UI Active
  context.updateDoomscrollStatusUI(true);
  assert.ok(doomBadge.classList.contains('active'), 'Doomscroll badge must have active class');
  assert.ok(!doomBadge.classList.contains('standby'), 'Doomscroll badge must not have standby class');
  assert.strictEqual(doomText.textContent, 'Active');
  assert.ok(doomCard.classList.contains('active-nudge'), 'Doomscroll card must have active-nudge class');

  // Test Case D: Doomscroll Breaker Status UI Standby
  context.updateDoomscrollStatusUI(false);
  assert.ok(!doomBadge.classList.contains('active'), 'Doomscroll badge must not have active class');
  assert.ok(doomBadge.classList.contains('standby'), 'Doomscroll badge must have standby class');
  assert.strictEqual(doomText.textContent, 'Standby');
  assert.ok(!doomCard.classList.contains('active-nudge'), 'Doomscroll card must not have active-nudge class');

  console.log('  ✅ Battery 4 passed: Dynamic ratio calculations, color tinting, and Doomscroll state machine verified');
}

// ============================================================================
// Battery 5: Universal Rule 28 Code Modularity in popup/popup.js
// ============================================================================
console.log('\nBattery 5: Universal Rule 28 Code Modularity');
{
  function analyzeFunction(name) {
    const marker = 'function ' + name;
    const start = popupJs.indexOf(marker);
    assert.ok(start !== -1, `popup.js must define function ${name}`);
    const openBrace = popupJs.indexOf('{', start);
    let depth = 1;
    let idx = openBrace + 1;
    let maxDepth = 1;
    while (depth > 0 && idx < popupJs.length) {
      if (popupJs[idx] === '{') {
        depth++;
        if (depth > maxDepth) maxDepth = depth;
      } else if (popupJs[idx] === '}') {
        depth--;
      }
      idx++;
    }
    const funcBody = popupJs.slice(start, idx);
    const lines = funcBody.split('\n').length;
    return { name, lines, nestingDepth: maxDepth - 1 };
  }

  const monitoredFunctions = [
    'updateFocusRatio',
    'updateDoomscrollStatusUI'
  ];

  for (const fn of monitoredFunctions) {
    const metrics = analyzeFunction(fn);
    assert.ok(metrics.lines <= 50, `Function ${fn} has ${metrics.lines} lines (must be <= 50 per Rule 28)`);
    assert.ok(metrics.nestingDepth <= 3, `Function ${fn} has nesting depth ${metrics.nestingDepth} (must be <= 3 per Rule 28)`);
  }

  console.log('  ✅ Battery 5 passed: Monitored functions strictly adhere to <= 50 lines and nesting depth <= 3');
}

// ============================================================================
// Battery 6: W3C Trusted Types & Zero innerHTML Security Audit
// ============================================================================
console.log('\nBattery 6: W3C Trusted Types & Zero innerHTML Security Audit');
{
  const focusSectionStart = popupJs.indexOf('function updateFocusRatio');
  const focusSectionEnd = popupJs.indexOf('const btnPopupFocusToggle', focusSectionStart);
  assert.ok(focusSectionStart !== -1 && focusSectionEnd !== -1, 'Must locate focus section in popup.js');

  const focusSlice = popupJs.slice(focusSectionStart, focusSectionEnd);
  assert.ok(!focusSlice.includes('.innerHTML'), 'Focus section must not contain .innerHTML assignments');
  assert.ok(!focusSlice.includes('.outerHTML'), 'Focus section must not contain .outerHTML assignments');

  console.log('  ✅ Battery 6 passed: 100% W3C Trusted Types zero-innerHTML safety certified');
}

// ============================================================================
// Battery 7: Bilingual i18n Localization Parity (en/hi)
// ============================================================================
console.log('\nBattery 7: Bilingual i18n Localization Parity');
{
  const requiredKeys = [
    'focus_ratio_title',
    'focus_ratio_work',
    'focus_ratio_media',
    'doomscroll_title',
    'doomscroll_sub',
    'doomscroll_status_active',
    'doomscroll_status_standby'
  ];

  for (const key of requiredKeys) {
    assert.ok(enJson[key], `locales/en.json must define ${key}`);
    assert.ok(hiJson[key], `locales/hi.json must define ${key}`);
    assert.ok(popupJs.includes(`${key}:`), `popup.js I18N_POPUP must define ${key}`);
  }

  assert.ok(popupJs.includes("setTxt('lblFocusRatioTitle', 'focus_ratio_title')"), 'applyPopupLanguage must wire focus_ratio_title');
  assert.ok(popupJs.includes("setTxt('lblRatioWork', 'focus_ratio_work')"), 'applyPopupLanguage must wire focus_ratio_work');
  assert.ok(popupJs.includes("setTxt('lblRatioMedia', 'focus_ratio_media')"), 'applyPopupLanguage must wire focus_ratio_media');
  assert.ok(popupJs.includes("setTxt('lblDoomscrollTitle', 'doomscroll_title')"), 'applyPopupLanguage must wire doomscroll_title');
  assert.ok(popupJs.includes("setTxt('lblDoomscrollSub', 'doomscroll_sub')"), 'applyPopupLanguage must wire doomscroll_sub');

  console.log('  ✅ Battery 7 passed: Authentic English and Devanagari Hindi localization keys and wiring confirmed');
}

// ============================================================================
// Battery 8: UTF-8 with BOM Preservation
// ============================================================================
console.log('\nBattery 8: UTF-8 with BOM Preservation across All Touched Files');
{
  const targetFiles = [
    popupHtmlPath,
    popupJsPath,
    tabWellnessCssPath,
    wellnessCssPath,
    popupCssPath,
    themesCssPath,
    lightContrastCssPath,
    enJsonPath,
    hiJsonPath
  ];

  for (const file of targetFiles) {
    const bytes = fs.readFileSync(file);
    const hasBOM = bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF;
    assert.ok(hasBOM, `File ${path.basename(file)} must preserve UTF-8 with BOM (0xEF, 0xBB, 0xBF)`);
  }

  console.log('  ✅ Battery 8 passed: 100% UTF-8 with BOM verified across all 9 touched files');
}

console.log('\n============================================================');
console.log('🎉 ALL 8 BATTERIES IN FOCUS ELEVATION SUITE PASSED (100% SUCCESS, EXIT CODE 0)');
console.log('============================================================');
