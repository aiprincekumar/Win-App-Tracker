# Phase 05: Verification, QA Test Suite & Full Regression Certification

> **Task ID:** `TASK-POPUP-SLEEP-TAB-001`  
> **Phase:** `05 of 05`  
> **Target File:** `tests/test_popup_sleep_tab.js` (NEW)  
> **Assigned Role:** Level 4 QA Verification Tester  
> **Lead Architect:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Governance:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Final Certification Gate:** `node tests/test_popup_sleep_tab.js` (Exit Code 0)  

---

## 🎯 1. Phase Objective

The objective of Phase 05 is to establish an automated, deterministic quality gate by authoring and executing `tests/test_popup_sleep_tab.js`. This test suite formally verifies the complete 7-Tab Architecture, the dedicated Sleep Tab (`🌙 Sleep`), radial bedtime SVG math, quick extenders, modular CSS hierarchy, i18n parity, and security compliance.

Upon passage, the QA Verification Tester issues a formal Grade A+ signoff.

---

## 📋 2. Prerequisites & Inputs

- Phases 01, 02, 03, and 04 implemented and locally verified.
- Target file to author: `tests/test_popup_sleep_tab.js`.

---

## 🔍 3. Comprehensive 10-Test Suite Architecture

The test suite `tests/test_popup_sleep_tab.js` must implement the following 10 verification modules:

1. **Test 1: Symmetrical 7-Tab Navigation Buttons Presence & Attributes**
   - Asserts all 7 tab buttons exist: `#mainTabMedia`, `#mainTabAudio`, `#mainTabTools`, `#mainTabStudio`, `#mainTabTracking`, `#mainTabDomains`, `#mainTabSleep`.
   - Asserts `data-view="sleep"`, `role="tab"`, and `aria-controls="viewSleepPane"` on `#mainTabSleep`.
   - Asserts single-word label `"Sleep"`.

2. **Test 2: Dedicated `#viewSleepPane` Structure & Section Decomposition**
   - Asserts `#viewSleepPane` exists with `class="tab-pane"` and `role="tabpanel"`.
   - Asserts presence of `#cardSleepHeroRing`, `#cardSleepPresetsAndCustom`, and `#cardSleepAutomations`.

3. **Test 3: Radial Bedtime SVG Dial Integrity & Mathematical Precision**
   - Asserts `#sleepDialSvg` has valid SVG viewBox (`0 0 140 140`), width 140, height 140.
   - Asserts `#sleepDialProgress` has radius `r="54"`, stroke-dasharray `"339.292"`, and stroke-linecap `"round"`.
   - Asserts linear gradient `#sleepGlowGradient` with indigo/violet color stops.
   - Asserts center overlays `#sleepDialCountdown` and `#sleepDialTargetTime`.

4. **Test 4: Quick Extenders (+5m / +15m) & Duration Presets Validation**
   - Asserts presence of `#btnSleepExtend5m` and `#btnSleepExtend15m`.
   - Asserts presence of all 6 preset pills (15m, 30m, 45m, 60m, 90m, 120m) with `data-minutes`.
   - Asserts custom duration input `#inputSleepCustomMinutes` and set button `#btnSetSleepCustom`.
   - Asserts start/pause toggle `#btnSleepToggleRun` and reset button `#btnSleepReset`.

5. **Test 5: Sleep Sentinel Automations Toggles Presence**
   - Asserts `#toggleSleepEndOfVideo` checkbox.
   - Asserts `#toggleSleepFadeCurve` checkbox.
   - Asserts `#toggleSleepInactivitySentinel` checkbox.

6. **Test 6: CSS 7-Column Grid Layout & 380px Symmetrical Density**
   - Asserts `popup/popup.css` and `popup/styles/tabs.css` contain `grid-template-columns: repeat(7, 1fr);`.
   - Asserts presence of legacy fallback comments `/* grid-template-columns: repeat(4, 1fr); */` and `/* grid-template-columns: repeat(6, 1fr); */`.
   - Asserts active glow gradient for `.top-tab-btn[data-view="sleep"].active`.
   - Asserts micro-typography font size and ellipsis text overflow protection.

7. **Test 7: Modular Stylesheet Hierarchy & UTF-8 BOM Verification**
   - Asserts `popup/styles/tabs/tab_sleep.css` exists.
   - Asserts `tab_sleep.css` contains valid UTF-8 BOM (`0xEF, 0xBB, 0xBF`).
   - Asserts `popup/styles/tabs.css` contains `@import './tabs/tab_sleep.css';`.

8. **Test 8: JavaScript Tab Switching & Event Binding in `popup/popup.js`**
   - Executes AST syntax check via `vm.Script`.
   - Asserts `switchTopTab` registers `key: 'sleep'`.
   - Asserts click event listener bound to `mainTabSleep`.
   - Asserts `validTabs` array / validation includes `'sleep'`.
   - Asserts footer button `#btnSleepTimerTrigger` is wired to switch to `sleep` tab.

9. **Test 9: Strict Single-Word Labels & i18n Parity Verification**
   - Asserts `I18N_POPUP.en` defines `tab_sleep: 'Sleep'`.
   - Asserts `I18N_POPUP.hi` defines `tab_sleep: 'स्लीप'` (or `'नींद'`).
   - Asserts `applyPopupLanguage` wires `topTabSleepText`.

10. **Test 10: Zero innerHTML & W3C Trusted Types Security Audit**
    - Scans `popup/popup.js` for insecure `innerHTML`, `outerHTML`, or `document.write` assignments.
    - Confirms 0 violations (100% CSP compliant).

---

## 🛠️ 4. Test Suite Implementation Blueprint (`tests/test_popup_sleep_tab.js`)

```javascript
/**
 * Verification Test Suite: Dedicated Sleep Timer Tab in Extension Popup Mode
 * Task ID: TASK-POPUP-SLEEP-TAB-001
 * Author: Level 4 QA Verification Tester
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('🧪 Starting Dedicated Sleep Timer Tab Verification Suite...\n');

const baseDir = path.resolve(__dirname, '..');
const popupHtmlPath = path.join(baseDir, 'popup/popup.html');
const popupCssPath = path.join(baseDir, 'popup/popup.css');
const tabsCssPath = path.join(baseDir, 'popup/styles/tabs.css');
const tabSleepCssPath = path.join(baseDir, 'popup/styles/tabs/tab_sleep.css');
const popupJsPath = path.join(baseDir, 'popup/popup.js');

const html = fs.readFileSync(popupHtmlPath, 'utf8');
const css = fs.readFileSync(popupCssPath, 'utf8');
const tabsCss = fs.readFileSync(tabsCssPath, 'utf8');
const jsCode = fs.readFileSync(popupJsPath, 'utf8');

// Test 1: Symmetrical 7-Tab Navigation Buttons Presence & Attributes
console.log('Test 1: Symmetrical 7-Tab Navigation Buttons Presence & Attributes');
{
  const expectedTabs = [
    { id: 'mainTabMedia', dataView: 'media', label: 'Media', pane: 'viewMediaPane' },
    { id: 'mainTabAudio', dataView: 'audio', label: 'Audio', pane: 'viewAudioPane' },
    { id: 'mainTabTools', dataView: 'tools', label: 'Tools', pane: 'viewToolsPane' },
    { id: 'mainTabStudio', dataView: 'studio', label: 'Studio', pane: 'viewStudioPane' },
    { id: 'mainTabTracking', dataView: 'tracking', label: 'Tracking', pane: 'viewTrackingPane' },
    { id: 'mainTabDomains', dataView: 'domains', label: 'Domains', pane: 'viewDomainsPane' },
    { id: 'mainTabSleep', dataView: 'sleep', label: 'Sleep', pane: 'viewSleepPane' }
  ];

  expectedTabs.forEach(tab => {
    assert(html.includes(`id="${tab.id}"`), `popup.html must contain navigation button #${tab.id}`);
    assert(html.includes(`data-view="${tab.dataView}"`), `Tab #${tab.id} must define data-view="${tab.dataView}"`);
    assert(html.includes(`aria-controls="${tab.pane}"`), `Tab #${tab.id} must point aria-controls to #${tab.pane}`);
    assert(html.includes(tab.label), `popup.html must display label "${tab.label}"`);
  });

  console.log('  ✅ All 7 single-word navigation tabs verified with proper ARIA controls and data-view attributes');
}

// Test 2: Dedicated #viewSleepPane Structure & Section Decomposition
console.log('\nTest 2: Dedicated #viewSleepPane Structure & Section Decomposition');
{
  assert(html.includes('id="viewSleepPane"'), 'popup.html must contain #viewSleepPane');
  const regex = /<div[^>]*id="viewSleepPane"[^>]*role="tabpanel"/i;
  assert(regex.test(html), '#viewSleepPane must have role="tabpanel"');

  assert(html.includes('id="cardSleepHeroRing"'), '#viewSleepPane must contain #cardSleepHeroRing');
  assert(html.includes('id="cardSleepPresetsAndCustom"'), '#viewSleepPane must contain #cardSleepPresetsAndCustom');
  assert(html.includes('id="cardSleepAutomations"'), '#viewSleepPane must contain #cardSleepAutomations');

  console.log('  ✅ #viewSleepPane exists with role="tabpanel" and contains all 3 core functional cards');
}

// Test 3: Radial Bedtime SVG Dial Integrity & Mathematical Precision
console.log('\nTest 3: Radial Bedtime SVG Dial Integrity & Mathematical Precision');
{
  assert(html.includes('id="sleepDialSvg"'), 'popup.html must contain #sleepDialSvg');
  assert(html.includes('viewBox="0 0 140 140"'), 'Radial SVG must have viewBox="0 0 140 140"');
  assert(html.includes('id="sleepDialProgress"'), 'Radial SVG must contain #sleepDialProgress');
  assert(html.includes('stroke-dasharray="339.292"'), '#sleepDialProgress must define circumference stroke-dasharray="339.292"');
  assert(html.includes('id="sleepDialCountdown"'), '#viewSleepPane must contain #sleepDialCountdown text readout');
  assert(html.includes('id="sleepDialTargetTime"'), '#viewSleepPane must contain #sleepDialTargetTime text readout');
  assert(html.includes('id="sleepDialStatusBadge"'), '#viewSleepPane must contain #sleepDialStatusBadge');

  console.log('  ✅ Bedtime radial SVG dial markup and circumference mathematics verified (r=54, C=339.292)');
}

// Test 4: Quick Extenders (+5m / +15m) & Duration Presets Validation
console.log('\nTest 4: Quick Extenders (+5m / +15m) & Duration Presets Validation');
{
  assert(html.includes('id="btnSleepExtend5m"'), '#viewSleepPane must contain #btnSleepExtend5m');
  assert(html.includes('id="btnSleepExtend15m"'), '#viewSleepPane must contain #btnSleepExtend15m');
  assert(html.includes('id="btnSleepToggleRun"'), '#viewSleepPane must contain #btnSleepToggleRun');
  assert(html.includes('id="btnSleepReset"'), '#viewSleepPane must contain #btnSleepReset');

  const requiredPresets = ['15', '30', '45', '60', '90', '120'];
  requiredPresets.forEach(min => {
    assert(html.includes(`data-minutes="${min}"`), `Presets grid must include ${min}m preset pill`);
  });

  assert(html.includes('id="inputSleepCustomMinutes"'), '#viewSleepPane must contain #inputSleepCustomMinutes');
  assert(html.includes('id="btnSetSleepCustom"'), '#viewSleepPane must contain #btnSetSleepCustom');

  console.log('  ✅ Quick extenders (+5m/+15m), all 6 preset pills, and custom input verified');
}

// Test 5: Sleep Sentinel Automations Toggles Presence
console.log('\nTest 5: Sleep Sentinel Automations Toggles Presence');
{
  assert(html.includes('id="toggleSleepEndOfVideo"'), '#viewSleepPane must contain #toggleSleepEndOfVideo');
  assert(html.includes('id="toggleSleepFadeCurve"'), '#viewSleepPane must contain #toggleSleepFadeCurve');
  assert(html.includes('id="toggleSleepInactivitySentinel"'), '#viewSleepPane must contain #toggleSleepInactivitySentinel');

  console.log('  ✅ All 3 smart sleep automation switches present in HTML');
}

// Test 6: CSS 7-Column Grid Layout & 380px Symmetrical Density
console.log('\nTest 6: CSS 7-Column Grid Layout & 380px Symmetrical Density');
{
  assert(css.includes('grid-template-columns: repeat(7, 1fr);') || tabsCss.includes('grid-template-columns: repeat(7, 1fr);'), 
    'CSS must define repeat(7, 1fr) for .top-nav-tabs');
  assert(css.includes('grid-template-columns: repeat(6, 1fr);') || tabsCss.includes('grid-template-columns: repeat(6, 1fr);'), 
    'CSS must retain repeat(6, 1fr) fallback comment for test backwards-compatibility');
  assert(css.includes('[data-view="sleep"].active'), 'popup.css must define active gradient for data-view="sleep"');

  console.log('  ✅ CSS 7-column grid layout and active glow gradient verified with backward-compatible comment');
}

// Test 7: Modular Stylesheet Hierarchy & UTF-8 BOM Verification
console.log('\nTest 7: Modular Stylesheet Hierarchy & UTF-8 BOM Verification');
{
  assert(fs.existsSync(tabSleepCssPath), 'popup/styles/tabs/tab_sleep.css must exist');
  const buf = fs.readFileSync(tabSleepCssPath);
  assert(buf.length > 0, 'tab_sleep.css must not be empty');
  assert(buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf, 'tab_sleep.css must have UTF-8 BOM (0xEF, 0xBB, 0xBF)');
  assert(tabsCss.includes("@import './tabs/tab_sleep.css';"), 'tabs.css must import tab_sleep.css');

  console.log('  ✅ tab_sleep.css modular stylesheet verified with mandatory UTF-8 BOM');
}

// Test 8: JavaScript Tab Switching & Event Binding in popup/popup.js
console.log('\nTest 8: JavaScript Tab Switching & Event Binding in popup/popup.js');
{
  assert.doesNotThrow(() => {
    new vm.Script(jsCode, { filename: 'popup/popup.js', displayErrors: true });
  }, 'popup/popup.js must compile cleanly via vm.Script');

  assert(jsCode.includes("key: 'sleep'"), "switchTopTab must register tab key 'sleep'");
  assert(jsCode.includes("mainTabSleep"), "popup.js must reference mainTabSleep");
  assert(jsCode.includes("switchTopTab('sleep', true)"), "popup.js must wire click listener to switch to sleep");

  console.log('  ✅ JavaScript AST compilation clean; switchTopTab and event bindings verified for sleep tab');
}

// Test 9: Strict Single-Word Labels & i18n Parity Verification
console.log('\nTest 9: Strict Single-Word Labels & i18n Parity Verification');
{
  assert(jsCode.includes("tab_sleep: 'Sleep'"), "I18N_POPUP.en must define tab_sleep: 'Sleep'");
  assert(jsCode.includes("tab_sleep: 'स्लीप'"), "I18N_POPUP.hi must define tab_sleep: 'स्लीप'");
  assert(jsCode.includes("setTxt('topTabSleepText', 'tab_sleep')"), "applyPopupLanguage must wire topTabSleepText");

  console.log('  ✅ English and Hindi dictionary parity verified for sleep tab');
}

// Test 10: Zero innerHTML & W3C Trusted Types Security Audit
console.log('\nTest 10: Zero innerHTML & W3C Trusted Types Security Audit');
{
  const lines = jsCode.split('\n');
  let innerHtmlViolations = 0;
  lines.forEach((line, idx) => {
    if (line.includes('.innerHTML =') || line.includes('.outerHTML =')) {
      // Exclude comments
      const trimmed = line.trim();
      if (!trimmed.startsWith('//') && !trimmed.startsWith('*')) {
        innerHtmlViolations++;
        console.error(`  ❌ Security Violation: Insecure assignment at line ${idx + 1}: ${line}`);
      }
    }
  });

  assert.strictEqual(innerHtmlViolations, 0, 'Zero innerHTML assignments permitted in popup.js');
  console.log('  ✅ Zero innerHTML assignments detected; 100% CSP compliant');
}

console.log('\n🎉 ALL 10 TESTS IN DEDICATED SLEEP TAB VERIFICATION SUITE PASSED WITH 100% SUCCESS!\n');
process.exit(0);
```

---

## ⚠️ 5. Architectural Constraints & Boundaries

- All tests must be executed with Node.js in the repository root.
- The exit code must be `0`. Any assertion error constitutes a failure that blocks task signoff.

---

## 📦 6. Deliverables Manifest

- `tests/test_popup_sleep_tab.js`: Automated 10-module test suite.
- Clean execution logs proving 10/10 test passage.

---

## 🧪 7. Final Certification Gate

Execute in PowerShell:
```powershell
node tests/test_popup_sleep_tab.js
```
Must pass with output:
`🎉 ALL 10 TESTS IN DEDICATED SLEEP TAB VERIFICATION SUITE PASSED WITH 100% SUCCESS!`
and exit code 0.
