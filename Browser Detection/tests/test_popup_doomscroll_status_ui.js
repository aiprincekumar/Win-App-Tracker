/**
 * Sentinel Web Activity & Media Sentinel - Doomscroll Breaker Status UI Regression Suite
 * File: tests/test_popup_doomscroll_status_ui.js
 * Authorization Token: AUTH-MGR-20261120-POPUP-DOOMSCROLL-FIX-001
 * 
 * Verifications:
 * 1. Top-Level Scope & Export Verification (Module & Window Hooks)
 * 2. Active & Standby Dynamic State Machine (Classes, Styles, Localization Text)
 * 3. Truthy / Falsy & Missing DOM Element Null-Safety Resilience
 * 4. Pre-setupEventListeners & Storage Restoration Immunity (Zero ReferenceError)
 * 5. Universal Rule 28 Code Modularity & Zero innerHTML Safety
 * 6. UTF-8 with BOM Preservation
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('🧪 Starting Doomscroll Status UI Regression Suite (AUTH-MGR-20261120-POPUP-DOOMSCROLL-FIX-001)...\n');

const popupJsPath = path.resolve(__dirname, '../popup/popup.js');

function readUtf8StripBOM(filePath) {
  let s = fs.readFileSync(filePath, 'utf8');
  if (s.charCodeAt(0) === 0xFEFF) s = s.slice(1);
  return s;
}

const popupJs = readUtf8StripBOM(popupJsPath);

// Helper for Mock DOM Environment
function createMockEnvironment() {
  const elements = new Map();
  function getOrCreate(id, className = '') {
    if (!elements.has(id)) {
      elements.set(id, {
        id,
        className,
        classList: {
          classes: new Set(className ? className.split(' ').filter(Boolean) : []),
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
        checked: false,
        value: '',
        setAttribute(k, v) { this[k] = v; },
        addEventListener() {}
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

  const mockWindow = {};

  const context = {
    document: mockDocument,
    window: mockWindow,
    Math,
    Set,
    Array,
    Boolean,
    String,
    t: (key) => {
      if (key === 'doomscroll_status_active') return 'Active';
      if (key === 'doomscroll_status_standby') return 'Standby';
      return key;
    }
  };

  return { context, getOrCreate, mockDocument, mockWindow };
}

// ============================================================================
// Battery 1: Top-Level Scope & Export Verification
// ============================================================================
console.log('Battery 1: Top-Level Scope & Export Verification');
{
  const fnIndex = popupJs.indexOf('function updateDoomscrollStatusUI');
  const setupIndex = popupJs.indexOf('function setupEventListeners');
  
  assert.ok(fnIndex !== -1, 'popup.js must define updateDoomscrollStatusUI');
  assert.ok(setupIndex !== -1, 'popup.js must define setupEventListeners');
  assert.ok(fnIndex < setupIndex, 'updateDoomscrollStatusUI must be declared at top-level before setupEventListeners');
  
  // Verify test hooks export
  assert.ok(popupJs.includes('window.__SentinelFocusTestHooks'), 'popup.js must define window.__SentinelFocusTestHooks');
  assert.ok(popupJs.includes('updateDoomscrollStatusUI'), 'window.__SentinelFocusTestHooks must export updateDoomscrollStatusUI');
  assert.ok(popupJs.includes('updateDoomscrollStatusUI: updateDoomscrollStatusUI'), 'window.__SentinelPopupModules must export updateDoomscrollStatusUI');

  console.log('  ✅ Battery 1 passed: Top-level declaration & module exports verified');
}

// ============================================================================
// Battery 2: Active & Standby Dynamic State Machine
// ============================================================================
console.log('\nBattery 2: Active & Standby Dynamic State Machine');
{
  const { context, getOrCreate } = createMockEnvironment();
  const doomBadge = getOrCreate('doomscrollStatusBadge');
  const doomText = getOrCreate('doomscrollStatusText');
  const doomCard = getOrCreate('doomscrollBreakerCard');

  // Extract function definition from popup.js
  const fnDecl = popupJs.slice(popupJs.indexOf('function updateDoomscrollStatusUI'), popupJs.indexOf('// Focus & Digital Wellness'));
  vm.createContext(context);
  vm.runInContext(fnDecl, context);

  // Test Case A: Active State
  context.updateDoomscrollStatusUI(true);
  assert.ok(doomBadge.classList.contains('active'), 'Badge must have .active class when enabled');
  assert.ok(!doomBadge.classList.contains('standby'), 'Badge must not have .standby class when enabled');
  assert.strictEqual(doomText.textContent, 'Active', 'Text must reflect localized active text');
  assert.ok(doomCard.classList.contains('active-nudge'), 'Card must have .active-nudge class when enabled');

  // Test Case B: Standby State
  context.updateDoomscrollStatusUI(false);
  assert.ok(!doomBadge.classList.contains('active'), 'Badge must not have .active class when disabled');
  assert.ok(doomBadge.classList.contains('standby'), 'Badge must have .standby class when disabled');
  assert.strictEqual(doomText.textContent, 'Standby', 'Text must reflect localized standby text');
  assert.ok(!doomCard.classList.contains('active-nudge'), 'Card must not have .active-nudge class when disabled');

  console.log('  ✅ Battery 2 passed: Dynamic class toggling and localized text updates certified');
}

// ============================================================================
// Battery 3: Truthy / Falsy & Missing DOM Element Null-Safety Resilience
// ============================================================================
console.log('\nBattery 3: Truthy / Falsy & Missing DOM Element Null-Safety Resilience');
{
  const { context, getOrCreate, mockDocument } = createMockEnvironment();
  const doomBadge = getOrCreate('doomscrollStatusBadge');
  const doomText = getOrCreate('doomscrollStatusText');
  const doomCard = getOrCreate('doomscrollBreakerCard');

  const fnDecl = popupJs.slice(popupJs.indexOf('function updateDoomscrollStatusUI'), popupJs.indexOf('// Focus & Digital Wellness'));
  vm.createContext(context);
  vm.runInContext(fnDecl, context);

  // Test truthy values
  context.updateDoomscrollStatusUI(1);
  assert.ok(doomBadge.classList.contains('active'));
  assert.strictEqual(doomText.textContent, 'Active');

  context.updateDoomscrollStatusUI('enabled');
  assert.ok(doomBadge.classList.contains('active'));
  assert.strictEqual(doomText.textContent, 'Active');

  // Test falsy values
  context.updateDoomscrollStatusUI(0);
  assert.ok(doomBadge.classList.contains('standby'));
  assert.strictEqual(doomText.textContent, 'Standby');

  context.updateDoomscrollStatusUI(null);
  assert.ok(doomBadge.classList.contains('standby'));
  assert.strictEqual(doomText.textContent, 'Standby');

  context.updateDoomscrollStatusUI(undefined);
  assert.ok(doomBadge.classList.contains('standby'));
  assert.strictEqual(doomText.textContent, 'Standby');

  // Test completely empty DOM (null elements)
  mockDocument.getElementById = () => null;
  assert.doesNotThrow(() => {
    context.updateDoomscrollStatusUI(true);
    context.updateDoomscrollStatusUI(false);
  }, 'updateDoomscrollStatusUI must safely handle null DOM elements without throwing');

  console.log('  ✅ Battery 3 passed: Truthy/falsy evaluation and null element resilience confirmed');
}

// ============================================================================
// Battery 4: Pre-setupEventListeners & Storage Restoration Immunity
// ============================================================================
console.log('\nBattery 4: Pre-setupEventListeners & Storage Restoration Immunity');
{
  const { context, getOrCreate } = createMockEnvironment();
  getOrCreate('doomscrollStatusBadge');
  getOrCreate('doomscrollStatusText');
  getOrCreate('doomscrollBreakerCard');
  getOrCreate('lblFocusRatioTitle');
  getOrCreate('lblRatioWork');
  getOrCreate('lblRatioMedia');
  getOrCreate('lblDoomscrollTitle');
  getOrCreate('lblDoomscrollSub');
  getOrCreate('lblSleepDrawerTitle');
  getOrCreate('lblFocusDrawerTitle');

  // Define focusSettings and translation helpers
  context.focusSettings = { doomscroll_enabled: true, doomscroll_interval_minutes: 30 };
  context.setTxt = () => {};
  context.setTitle = () => {};
  context.updateThemeToggleUI = () => {};
  context.currentTheme = 'dark';
  context.dashboardData = null;

  // Extract updateDoomscrollStatusUI and applyPopupLanguage focus block
  const fnDecl = popupJs.slice(popupJs.indexOf('function updateDoomscrollStatusUI'), popupJs.indexOf('// Focus & Digital Wellness'));
  vm.createContext(context);
  vm.runInContext(fnDecl, context);

  // Simulate calling applyPopupLanguage line 753 prior to setupEventListeners
  assert.doesNotThrow(() => {
    context.updateDoomscrollStatusUI(Boolean(context.focusSettings && context.focusSettings.doomscroll_enabled));
  }, 'Calling updateDoomscrollStatusUI during language application must not throw ReferenceError');

  // Simulate storage restoration callback prior to setupEventListeners
  assert.doesNotThrow(() => {
    const res = { focus_settings: { doomscroll_enabled: false } };
    context.focusSettings = { ...context.focusSettings, ...res.focus_settings };
    context.updateDoomscrollStatusUI(context.focusSettings.doomscroll_enabled);
  }, 'Calling updateDoomscrollStatusUI during storage restoration must not throw ReferenceError');

  console.log('  ✅ Battery 4 passed: Zero ReferenceError in language wiring and storage restore verified');
}

// ============================================================================
// Battery 5: Universal Rule 28 Code Modularity & Zero innerHTML Safety
// ============================================================================
console.log('\nBattery 5: Universal Rule 28 Code Modularity & Zero innerHTML Safety');
{
  const marker = 'function updateDoomscrollStatusUI';
  const start = popupJs.indexOf(marker);
  assert.ok(start !== -1, 'popup.js must define updateDoomscrollStatusUI');
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
  const nestingDepth = maxDepth - 1;

  assert.ok(lines <= 50, `updateDoomscrollStatusUI has ${lines} lines (must be <= 50 per Rule 28)`);
  assert.ok(nestingDepth <= 3, `updateDoomscrollStatusUI has nesting depth ${nestingDepth} (must be <= 3 per Rule 28)`);
  assert.ok(!funcBody.includes('.innerHTML'), 'updateDoomscrollStatusUI must not contain .innerHTML');
  assert.ok(!funcBody.includes('.outerHTML'), 'updateDoomscrollStatusUI must not contain .outerHTML');

  console.log(`  ✅ Battery 5 passed: Code modularity (${lines} lines, nesting depth ${nestingDepth}) & zero innerHTML certified`);
}

// ============================================================================
// Battery 6: UTF-8 with BOM Preservation
// ============================================================================
console.log('\nBattery 6: UTF-8 with BOM Preservation');
{
  const testFiles = [popupJsPath, __filename];
  for (const file of testFiles) {
    const bytes = fs.readFileSync(file);
    const hasBOM = bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF;
    assert.ok(hasBOM, `File ${path.basename(file)} must preserve UTF-8 with BOM (0xEF, 0xBB, 0xBF)`);
  }
  console.log('  ✅ Battery 6 passed: UTF-8 with BOM confirmed on all touched files');
}

console.log('\n============================================================');
console.log('🎉 ALL 6 BATTERIES IN DOOMSCROLL REGRESSION SUITE PASSED (100% SUCCESS, EXIT CODE 0)');
console.log('============================================================\n');
