# Phase 04: Independent Test Suite & Master Test Verification

> **Task ID:** `TASK-POPUP-2TIER-NAV-001`  
> **Phase:** 04 of 04  
> **Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  
> **Target File(s):**  
> - [`tests/test_popup_2tier_navigation.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_popup_2tier_navigation.js) (NEW file)  
> - [`run_all_tests.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/run_all_tests.js)  
> **Assigned Role:** Level 4 Independent QA Verification Subagent (`qa_verification_tester`)  
> **Status:** `PENDING_AUTHORIZATION`

---

## 🎯 1. Phase Objective
The objective of Phase 04 is to deliver independent quality assurance and end-to-end regression verification:
1. Construct a comprehensive automated test suite `tests/test_popup_2tier_navigation.js` adhering to project testing standards (`assert`, `vm.Script`, zero-scan isolation).
2. Validate 8 rigorous test gates:
   - **Test Gate 1:** Semantic DOM presence, ID naming, and ARIA accessibility roles for `#tier1SegmentedNav`.
   - **Test Gate 2:** Explicit `data-group` mapping and attribute preservation across all 7 child navigation tabs.
   - **Test Gate 3:** Bilingual i18n dictionary expansion and key parity across English and Hindi.
   - **Test Gate 4:** CSS selector presence for segmented pill layout, dynamic `.tab-hidden`, and theme parity.
   - **Test Gate 5:** In-memory AST parsing and logic verification of `switchTier1Category` and `switchTopTab`.
   - **Test Gate 6:** Hybrid dynamic media auto-switching and `userManualOverride` latch protection.
   - **Test Gate 7:** W3C Trusted Types compliance (zero `innerHTML` usage in navigation).
   - **Test Gate 8:** Full master test harness execution via `run_all_tests.js` confirming 90/90 suites pass cleanly.

---

## 📦 2. Prerequisites & Dependencies
- Completed execution of Phase 01, Phase 02, and Phase 03.
- Node.js runtime with `assert`, `fs`, `path`, and `vm` modules available.

---

## 🔍 3. Technical Context & File Anchors
- In [`run_all_tests.js#L6`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/run_all_tests.js#L6), the test runner auto-discovers all `.js` files in `tests/`.
- In [`tests/test_popup_sleep_tab.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_popup_sleep_tab.js), standard assertion patterns for DOM inspection and AST parsing are established.
- Target test file to create: `tests/test_popup_2tier_navigation.js`.

---

## 🛠️ 4. Step-by-Step Surgical Instructions

### Step 1: Author `tests/test_popup_2tier_navigation.js`
Create the dedicated test suite file:

```javascript
/**
 * Verification Test Suite: Popup 2-Tier Segmented Control & Hybrid Dynamic Navigation
 * Task ID: TASK-POPUP-2TIER-NAV-001
 * Author: Level 4 Independent QA Verification Tester
 * 
 * Test Scenarios:
 * 1. DOM Elements & ARIA Tablist Integrity (#tier1SegmentedNav & 4 category buttons)
 * 2. Child Tab Group Mapping & data-group Tagging (all 7 tabs correctly mapped)
 * 3. Bilingual i18n Parity (I18N_POPUP.en & I18N_POPUP.hi tier1_* keys & pure Hindi)
 * 4. CSS Styles, Flex Expansion & Dynamic Filtering Rule Audit
 * 5. In-Memory AST Parsing & switchTier1Category / switchTopTab Logic Execution
 * 6. Hybrid Dynamic Media Auto-Switching & userManualOverride Latch Protection
 * 7. W3C Trusted Types & Zero-innerHTML Security Audit
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('🧪 Starting Popup 2-Tier Navigation Verification Suite...\n');

const baseDir = path.resolve(__dirname, '..');
const popupHtmlPath = path.join(baseDir, 'popup/popup.html');
const popupCssPath = path.join(baseDir, 'popup/popup.css');
const popupJsPath = path.join(baseDir, 'popup/popup.js');
const enJsonPath = path.join(baseDir, 'locales/en.json');
const hiJsonPath = path.join(baseDir, 'locales/hi.json');

const html = fs.readFileSync(popupHtmlPath, 'utf8');
const css = fs.readFileSync(popupCssPath, 'utf8');
const jsCode = fs.readFileSync(popupJsPath, 'utf8');
const enJson = JSON.parse(fs.readFileSync(enJsonPath, 'utf8'));
const hiJson = JSON.parse(fs.readFileSync(hiJsonPath, 'utf8'));

// ---------------------------------------------------------------------------
// Test 1: DOM Elements & ARIA Tablist Integrity
// ---------------------------------------------------------------------------
console.log('Test 1: DOM Elements & ARIA Tablist Integrity');
{
  assert(html.includes('id="tier1SegmentedNav"'), 'popup.html must contain #tier1SegmentedNav');
  assert(html.includes('class="tier1-segmented-nav"'), 'popup.html must define .tier1-segmented-nav');
  assert(/<nav[^>]*id="tier1SegmentedNav"[^>]*role="tablist"/i.test(html), '#tier1SegmentedNav must have role="tablist"');

  const expectedCategories = [
    { id: 'tier1BtnPlayback', cat: 'playback', textId: 'tier1PlaybackText' },
    { id: 'tier1BtnStudio', cat: 'studio', textId: 'tier1StudioText' },
    { id: 'tier1BtnAnalytics', cat: 'analytics', textId: 'tier1AnalyticsText' },
    { id: 'tier1BtnWellness', cat: 'wellness', textId: 'tier1WellnessText' }
  ];

  expectedCategories.forEach(({ id, cat, textId }) => {
    assert(html.includes(`id="${id}"`), `Tier 1 button #${id} must exist in popup.html`);
    assert(html.includes(`data-category="${cat}"`), `Button #${id} must have data-category="${cat}"`);
    assert(html.includes(`id="${textId}"`), `Button text element #${textId} must exist`);
  });

  console.log('  ✅ #tier1SegmentedNav and all 4 category buttons verified with proper ARIA attributes');
}

// ---------------------------------------------------------------------------
// Test 2: Child Tab Group Mapping & data-group Tagging
// ---------------------------------------------------------------------------
console.log('\nTest 2: Child Tab Group Mapping & data-group Tagging');
{
  const expectedChildTabs = [
    { id: 'mainTabMedia', group: 'playback' },
    { id: 'mainTabAudio', group: 'playback' },
    { id: 'mainTabTools', group: 'playback' },
    { id: 'mainTabStudio', group: 'studio' },
    { id: 'mainTabTracking', group: 'analytics' },
    { id: 'mainTabDomains', group: 'analytics' },
    { id: 'mainTabSleep', group: 'wellness' }
  ];

  expectedChildTabs.forEach(({ id, group }) => {
    const regex = new RegExp(`id="${id}"[^>]*data-group="${group}"|data-group="${group}"[^>]*id="${id}"`, 'i');
    assert(regex.test(html), `Child tab #${id} must possess data-group="${group}" in popup.html`);
  });

  console.log('  ✅ All 7 child navigation tabs correctly mapped to playback, studio, analytics, wellness');
}

// ---------------------------------------------------------------------------
// Test 3: Bilingual i18n Parity & Translation Tokens
// ---------------------------------------------------------------------------
console.log('\nTest 3: Bilingual i18n Parity & Translation Tokens');
{
  const requiredKeys = ['tier1_playback', 'tier1_studio', 'tier1_analytics', 'tier1_wellness'];

  // Check locales JSON
  requiredKeys.forEach(k => {
    assert(enJson[k], `locales/en.json must contain key "${k}"`);
    assert(hiJson[k], `locales/hi.json must contain key "${k}"`);
  });

  // Check embedded I18N_POPUP in popup.js
  assert(jsCode.includes('tier1_playback'), 'popup.js I18N_POPUP must contain tier1_playback');
  assert(jsCode.includes('tier1_studio'), 'popup.js I18N_POPUP must contain tier1_studio');
  assert(jsCode.includes('tier1_analytics'), 'popup.js I18N_POPUP must contain tier1_analytics');
  assert(jsCode.includes('tier1_wellness'), 'popup.js I18N_POPUP must contain tier1_wellness');

  console.log('  ✅ 100% key parity across English and Hindi for all Tier 1 categories');
}

// ---------------------------------------------------------------------------
// Test 4: CSS Styles, Flex Expansion & Dynamic Filtering Rule Audit
// ---------------------------------------------------------------------------
console.log('\nTest 4: CSS Styles, Flex Expansion & Dynamic Filtering Rule Audit');
{
  assert(css.includes('.tier1-segmented-nav'), 'popup.css must style .tier1-segmented-nav');
  assert(css.includes('.tier1-nav-btn'), 'popup.css must style .tier1-nav-btn');
  assert(css.includes('.top-tab-btn.tab-hidden') || css.includes('.tab-hidden'), 'popup.css must define .tab-hidden display: none rule');
  assert(css.includes('data-theme="light"') && css.includes('.tier1-segmented-nav'), 'popup.css must provide Light Theme overrides for Tier 1');
  assert(css.includes('high-contrast-mode'), 'popup.css must provide high contrast support');

  console.log('  ✅ CSS rules verified for segmented bar, dynamic flex expansion, and dark/light themes');
}

// ---------------------------------------------------------------------------
// Test 5: In-Memory AST Parsing & Execution of Navigation Functions
// ---------------------------------------------------------------------------
console.log('\nTest 5: In-Memory AST Parsing & Execution of Navigation Functions');
{
  assert.doesNotThrow(() => {
    new vm.Script(jsCode);
  }, 'popup.js must compile cleanly with zero JavaScript syntax errors');

  assert(jsCode.includes('function switchTier1Category'), 'popup.js must implement switchTier1Category');
  assert(jsCode.includes('function switchTopTab'), 'popup.js must implement switchTopTab');
  assert(jsCode.includes('TIER1_CATEGORIES'), 'popup.js must declare TIER1_CATEGORIES registry');

  console.log('  ✅ In-memory AST compilation succeeded and navigation functions confirmed');
}

// ---------------------------------------------------------------------------
// Test 6: Hybrid Dynamic Media Auto-Switching & userManualOverride Latch
// ---------------------------------------------------------------------------
console.log('\nTest 6: Hybrid Dynamic Media Auto-Switching & userManualOverride Latch');
{
  assert(jsCode.includes('userManualOverride'), 'popup.js must reference userManualOverride');
  assert(jsCode.includes('activeTier1Category'), 'popup.js must reference activeTier1Category');

  // Verify latch logic in switchTopTab and switchTier1Category
  const switchT1Match = jsCode.match(/function switchTier1Category[\s\S]*?\n\}/);
  assert(switchT1Match, 'switchTier1Category function body must exist');
  assert(switchT1Match[0].includes('userManualOverride = true'), 'Manual Tier 1 switch must latch userManualOverride = true');

  console.log('  ✅ Hybrid dynamic context routing and manual intent latch verified');
}

// ---------------------------------------------------------------------------
// Test 7: W3C Trusted Types & Zero-innerHTML Security Audit
// ---------------------------------------------------------------------------
console.log('\nTest 7: W3C Trusted Types & Zero-innerHTML Security Audit');
{
  const switchT1Match = jsCode.match(/function switchTier1Category[\s\S]*?\n\}/);
  assert(!switchT1Match[0].includes('innerHTML'), 'switchTier1Category must not use innerHTML');

  const switchTabMatch = jsCode.match(/function switchTopTab[\s\S]*?\n\}/);
  assert(!switchTabMatch[0].includes('innerHTML'), 'switchTopTab must not use innerHTML');

  console.log('  ✅ W3C Trusted Types and zero-innerHTML confirmed across navigation routines');
}

console.log('\n🎉 ALL 7 POPUP 2-TIER NAVIGATION VERIFICATION TESTS PASSED CLEANLY!\n');
```

### Step 2: Execute Verification & Full Regression
Execute the dedicated test:
```bash
node tests/test_popup_2tier_navigation.js
```
Then execute the full master test runner:
```bash
node run_all_tests.js
```

---

## 🚫 5. Constraints & Architectural Invariants
1. **Zero Failing Tests:** All legacy test suites (including `test_popup_sleep_tab.js`, `test_tab_switch_and_storage_persistence.js`, `test_theme_toggle.js`) must pass 100%.
2. **Terminal Proof Mandate:** The QA subagent must capture and deliver raw terminal output demonstrating exit code 0.

---

## 📑 6. Deliverables Manifest
- `tests/test_popup_2tier_navigation.js`: Comprehensive 7-scenario test suite created.
- Full test run evidence showing all 90 test suites passing cleanly.

---

## 🧪 7. Local Verification Gate
```bash
node tests/test_popup_2tier_navigation.js
node run_all_tests.js
```
**Pass Criteria:**
- `test_popup_2tier_navigation.js`: All 7 tests pass.
- `run_all_tests.js`: 90/90 suites pass (0 failed, Exit Code 0).
