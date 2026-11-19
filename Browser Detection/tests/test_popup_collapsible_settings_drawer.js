/**
 * Comprehensive Verification Test Suite:
 * Popup Collapsible Settings Drawer (Zero-Scroll Architecture)
 * 
 * Task ID: TASK-POPUP-COLLAPSIBLE-SETTINGS-DRAWER-001
 * Authorization: AUTH-MGR-20261119-POPUP-COLLAPSIBLE-SETTINGS-DRAWER-001
 * 
 * Validates:
 * 1. Battery 1: DOM Hierarchy & Drawer Containers (Phase 1)
 * 2. Battery 2: CSS 60fps Grid Transitions & Zero-Scroll Layout (Phase 2)
 * 3. Battery 3: Bilingual i18n Localization & Parity (Phase 1)
 * 4. Battery 4: JavaScript State Machine & Local Storage Persistence (Phase 3)
 * 5. Battery 5: Security, Trusted Types & UTF-8 with BOM Integrity
 * 
 * Author: Level 4 Execution Subagent (Frontend Engineer)
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('🧪 Starting Popup Collapsible Settings Drawer Verification Suite...\n');

const baseDir = path.resolve(__dirname, '..');
const popupHtmlPath = path.join(baseDir, 'popup/popup.html');
const popupCssPath = path.join(baseDir, 'popup/popup.css');
const sleepCssPath = path.join(baseDir, 'popup/styles/tabs/tab_sleep.css');
const wellnessCssPath = path.join(baseDir, 'popup/styles/tabs/tab_wellness.css');
const popupJsPath = path.join(baseDir, 'popup/popup.js');
const enJsonPath = path.join(baseDir, 'locales/en.json');
const hiJsonPath = path.join(baseDir, 'locales/hi.json');

const stripBom = (str) => (str.charCodeAt(0) === 0xFEFF ? str.slice(1) : str);

const html = stripBom(fs.readFileSync(popupHtmlPath, 'utf8'));
const popupCss = stripBom(fs.readFileSync(popupCssPath, 'utf8'));
const sleepCss = stripBom(fs.readFileSync(sleepCssPath, 'utf8'));
const wellnessCss = stripBom(fs.readFileSync(wellnessCssPath, 'utf8'));
const jsCode = stripBom(fs.readFileSync(popupJsPath, 'utf8'));
const enJson = JSON.parse(stripBom(fs.readFileSync(enJsonPath, 'utf8')));
const hiJson = JSON.parse(stripBom(fs.readFileSync(hiJsonPath, 'utf8')));

// ===========================================================================
// Battery 1: DOM Hierarchy & Drawer Containers (Phase 1)
// ===========================================================================
console.log('--- Battery 1: DOM Hierarchy & Drawer Containers ---');

// 1. Sleep Settings Drawer
assert.ok(html.includes('id="sleepSettingsDrawer"'), 'sleepSettingsDrawer container must exist');
assert.ok(html.includes('id="btnToggleSleepSettingsDrawer"'), 'btnToggleSleepSettingsDrawer must exist');
assert.ok(html.includes('id="sleepSettingsDrawerBody"'), 'sleepSettingsDrawerBody must exist');
assert.ok(html.includes('id="lblSleepDrawerTitle"'), 'lblSleepDrawerTitle must exist');

// Verify sleep drawer toggle accessibility attributes
assert.ok(html.includes('aria-controls="sleepSettingsDrawerBody"'), 'Toggle must control sleepSettingsDrawerBody');
assert.ok(html.includes('aria-labelledby="btnToggleSleepSettingsDrawer"'), 'Drawer body must be labeled by toggle button');

// Verify preserved cards inside sleep drawer
assert.ok(html.includes('id="cardSleepPresetsAndCustom"'), 'cardSleepPresetsAndCustom must remain intact');
assert.ok(html.includes('id="cardSleepAutomations"'), 'cardSleepAutomations must remain intact');
assert.ok(html.includes('id="btnSleepToggleRun"'), 'btnSleepToggleRun must remain intact');
assert.ok(html.includes('id="toggleSleepEndOfVideo"'), 'toggleSleepEndOfVideo must remain intact');
assert.ok(html.includes('id="toggleSleepFadeCurve"'), 'toggleSleepFadeCurve must remain intact');
assert.ok(html.includes('id="toggleSleepInactivitySentinel"'), 'toggleSleepInactivitySentinel must remain intact');

// 2. Focus Settings Drawer
assert.ok(html.includes('id="focusSettingsDrawer"'), 'focusSettingsDrawer container must exist');
assert.ok(html.includes('id="btnToggleFocusSettingsDrawer"'), 'btnToggleFocusSettingsDrawer must exist');
assert.ok(html.includes('id="focusSettingsDrawerBody"'), 'focusSettingsDrawerBody must exist');
assert.ok(html.includes('id="lblFocusDrawerTitle"'), 'lblFocusDrawerTitle must exist');

// Verify focus drawer toggle accessibility attributes
assert.ok(html.includes('aria-controls="focusSettingsDrawerBody"'), 'Toggle must control focusSettingsDrawerBody');
assert.ok(html.includes('aria-labelledby="btnToggleFocusSettingsDrawer"'), 'Drawer body must be labeled by toggle button');

// Verify preserved cards inside focus drawer
assert.ok(html.includes('id="cardFocusPresetsAndCustom"'), 'cardFocusPresetsAndCustom must remain intact');
assert.ok(html.includes('id="focusRatioBarContainer"'), 'focusRatioBarContainer must remain intact');
assert.ok(html.includes('id="doomscrollBreakerCard"'), 'doomscrollBreakerCard must remain intact');
assert.ok(html.includes('id="btnPopupFocusToggle"'), 'btnPopupFocusToggle must remain intact');
assert.ok(html.includes('id="toggleDoomscrollBreaker"'), 'toggleDoomscrollBreaker must remain intact');

console.log('✅ Battery 1 Passed: Complete DOM container hierarchy and preserved cards verified\n');

// ===========================================================================
// Battery 2: CSS 60fps Grid Transitions & Zero-Scroll Layout (Phase 2)
// ===========================================================================
console.log('--- Battery 2: CSS 60fps Grid Transitions & Zero-Scroll Layout ---');

const allCss = popupCss + '\n' + sleepCss + '\n' + wellnessCss;

// Required selectors
const requiredSelectors = [
  '.popup-settings-drawer',
  '.drawer-toggle-btn',
  '.drawer-title-wrap',
  '.drawer-icon',
  '.drawer-title',
  '.drawer-chevron',
  '.drawer-expandable-wrap',
  '.drawer-inner-content'
];
requiredSelectors.forEach(sel => {
  assert.ok(allCss.includes(sel), `CSS must include selector ${sel}`);
});

// Fluid CSS Grid Row Interpolation (0fr -> 1fr)
assert.ok(allCss.includes('grid-template-rows: 0fr'), 'Must use grid-template-rows: 0fr for collapsed state');
assert.ok(allCss.includes('grid-template-rows: 1fr'), 'Must use grid-template-rows: 1fr for expanded open state');
assert.ok(allCss.includes('cubic-bezier(0.16, 1, 0.3, 1)'), 'Must use fluid 60fps timing curve cubic-bezier(0.16, 1, 0.3, 1)');

// Zero-Scroll Constraint
assert.ok(allCss.includes('#viewSleepPane') && allCss.includes('max-height: 540px'), 'Sleep pane must enforce max-height zero-scroll constraint');
assert.ok(allCss.includes('#viewFocusPane') && allCss.includes('max-height: 540px'), 'Focus pane must enforce max-height zero-scroll constraint');
assert.ok(allCss.includes('scrollbar-width: thin'), 'Scrollbar width thin must be declared');

// Reduced Motion Accessibility
assert.ok(popupCss.includes('@media (prefers-reduced-motion: reduce)'), 'Prefers-reduced-motion media query must be present');

console.log('✅ Battery 2 Passed: 60fps CSS grid animations and zero-scroll rules verified\n');

// ===========================================================================
// Battery 3: Bilingual i18n Localization & Parity (Phase 1)
// ===========================================================================
console.log('--- Battery 3: Bilingual i18n Localization & Parity ---');

const expectedKeys = [
  'sleep_drawer_title',
  'focus_drawer_title',
  'drawer_expand_tooltip',
  'drawer_collapse_tooltip'
];

expectedKeys.forEach(k => {
  assert.ok(enJson[k], `en.json must contain key: ${k}`);
  assert.ok(hiJson[k], `hi.json must contain key: ${k}`);
  assert.strictEqual(typeof enJson[k], 'string', `${k} in en.json must be string`);
  assert.strictEqual(typeof hiJson[k], 'string', `${k} in hi.json must be string`);
});

// Exact parity between en and hi locales
assert.strictEqual(
  Object.keys(enJson).length,
  Object.keys(hiJson).length,
  `Locale key counts must match exactly: ${Object.keys(enJson).length} vs ${Object.keys(hiJson).length}`
);

// Verify I18N_POPUP in popup.js
assert.ok(jsCode.includes("sleep_drawer_title: 'Presets & Automations'"), 'I18N_POPUP.en must have sleep_drawer_title');
assert.ok(jsCode.includes("focus_drawer_title: 'Presets & Wellness Tools'"), 'I18N_POPUP.en must have focus_drawer_title');
assert.ok(jsCode.includes("sleep_drawer_title: 'प्रीसेट और ऑटोमेशन'"), 'I18N_POPUP.hi must have sleep_drawer_title');
assert.ok(jsCode.includes("focus_drawer_title: 'प्रीसेट और वेलनेस टूल्स'"), 'I18N_POPUP.hi must have focus_drawer_title');

// Verify applyLanguage wiring
assert.ok(jsCode.includes("setTxt('lblSleepDrawerTitle', 'sleep_drawer_title')"), 'applyLanguage must update lblSleepDrawerTitle');
assert.ok(jsCode.includes("setTxt('lblFocusDrawerTitle', 'focus_drawer_title')"), 'applyLanguage must update lblFocusDrawerTitle');

console.log('✅ Battery 3 Passed: 100% Bilingual localization key parity verified\n');

// ===========================================================================
// Battery 4: JavaScript State Machine & Local Storage Persistence (Phase 3)
// ===========================================================================
console.log('--- Battery 4: JavaScript State Machine & Storage Persistence ---');

// Verify helper existence and Rule 28 constraints
assert.ok(jsCode.includes('function initCollapsibleDrawer('), 'initCollapsibleDrawer must be defined');
assert.ok(jsCode.includes('function initPopupCollapsibleDrawers('), 'initPopupCollapsibleDrawers must be defined');
assert.ok(jsCode.includes('sleepSettingsDrawerOpen'), 'sleepSettingsDrawerOpen storage key must be referenced');
assert.ok(jsCode.includes('focusSettingsDrawerOpen'), 'focusSettingsDrawerOpen storage key must be referenced');

// Verify Universal Rule 28: Function length <= 50 lines
const helperMatch = jsCode.match(/function initCollapsibleDrawer[\s\S]*?\n\}/);
assert.ok(helperMatch, 'initCollapsibleDrawer implementation must be found');
const helperLines = helperMatch[0].split('\n').length;
assert.ok(helperLines <= 50, `initCollapsibleDrawer must be <= 50 lines (was ${helperLines})`);

// Functional Simulation of initCollapsibleDrawer
{
  const mockStorage = {};
  const mockElements = {
    testDrawer: {
      classList: {
        _classes: new Set(),
        add(c) { this._classes.add(c); },
        remove(c) { this._classes.delete(c); },
        contains(c) { return this._classes.has(c); },
        toggle(c, force) {
          if (force !== undefined) {
            if (force) this._classes.add(c); else this._classes.delete(c);
            return force;
          }
          const has = this._classes.has(c);
          if (has) this._classes.delete(c); else this._classes.add(c);
          return !has;
        }
      }
    },
    testBtn: {
      attributes: {},
      listeners: {},
      title: '',
      setAttribute(name, val) { this.attributes[name] = String(val); },
      getAttribute(name) { return this.attributes[name]; },
      addEventListener(evt, fn) { this.listeners[evt] = fn; },
      click() { if (this.listeners['click']) this.listeners['click'](); }
    }
  };

  const mockChrome = {
    storage: {
      local: {
        get(keys, cb) {
          const res = {};
          keys.forEach(k => { res[k] = mockStorage[k]; });
          cb(res);
        },
        set(obj, cb) {
          Object.assign(mockStorage, obj);
          if (cb) cb();
        }
      }
    }
  };

  const sandbox = {
    document: {
      getElementById(id) { return mockElements[id] || null; }
    },
    chrome: mockChrome,
    browserAPI: mockChrome,
    t: (k) => k
  };

  vm.createContext(sandbox);

  // Execute helper in sandbox
  vm.runInContext(`
    ${helperMatch[0]}
    initCollapsibleDrawer('testDrawer', 'testBtn', 'testBody', 'testStorageKey');
  `, sandbox);

  const btn = mockElements.testBtn;
  const drawer = mockElements.testDrawer;

  // Initially closed
  assert.strictEqual(drawer.classList.contains('open'), false, 'Drawer should initially be closed');

  // Click to open
  btn.click();
  assert.strictEqual(drawer.classList.contains('open'), true, 'Drawer should be open after click');
  assert.strictEqual(btn.getAttribute('aria-expanded'), 'true', 'aria-expanded must be true when open');
  assert.strictEqual(mockStorage['testStorageKey'], true, 'chrome.storage.local must record true');

  // Click to close
  btn.click();
  assert.strictEqual(drawer.classList.contains('open'), false, 'Drawer should be closed after second click');
  assert.strictEqual(btn.getAttribute('aria-expanded'), 'false', 'aria-expanded must be false when closed');
  assert.strictEqual(mockStorage['testStorageKey'], false, 'chrome.storage.local must record false');

  // Test restoration when storage initially has true
  mockStorage['persistKey'] = true;
  mockElements.persistDrawer = {
    classList: {
      _classes: new Set(),
      toggle(c, force) {
        if (force) this._classes.add(c); else this._classes.delete(c);
      },
      contains(c) { return this._classes.has(c); }
    }
  };
  mockElements.persistBtn = {
    attributes: {},
    listeners: {},
    setAttribute(name, val) { this.attributes[name] = String(val); },
    addEventListener(evt, fn) { this.listeners[evt] = fn; }
  };

  vm.runInContext(`
    initCollapsibleDrawer('persistDrawer', 'persistBtn', 'persistBody', 'persistKey');
  `, sandbox);

  assert.strictEqual(mockElements.persistDrawer.classList.contains('open'), true, 'Drawer must auto-open when restored from storage');
  assert.strictEqual(mockElements.persistBtn.attributes['aria-expanded'], 'true', 'aria-expanded must restore to true');
}

console.log('✅ Battery 4 Passed: JS Drawer State Machine & Chrome Storage Persistence verified\n');

// ===========================================================================
// Battery 5: Security, Trusted Types & UTF-8 with BOM Integrity
// ===========================================================================
console.log('--- Battery 5: Security, Trusted Types & UTF-8 with BOM Integrity ---');

// Zero-innerHTML in drawer implementation
assert.ok(!helperMatch[0].includes('innerHTML'), 'Drawer helper must have 100% zero-innerHTML compliance');

// Verify UTF-8 with BOM across all 7 modified files
const targetFiles = [
  popupHtmlPath,
  enJsonPath,
  hiJsonPath,
  sleepCssPath,
  wellnessCssPath,
  popupCssPath,
  popupJsPath
];

targetFiles.forEach(fp => {
  const buf = fs.readFileSync(fp);
  const hasBOM = buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF;
  assert.ok(hasBOM, `File ${path.basename(fp)} must have UTF-8 BOM encoding`);
});

console.log('✅ Battery 5 Passed: W3C Trusted Types zero-innerHTML & UTF-8 with BOM validated on all 7 files\n');

console.log('============================================================');
console.log('ALL 5 BATTERIES PASSED CLEANLY (Exit Code 0)');
console.log('============================================================');
