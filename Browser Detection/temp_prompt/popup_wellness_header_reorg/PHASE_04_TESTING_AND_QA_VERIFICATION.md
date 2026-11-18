# Phase 04: Test Suite Synchronization & Independent QA Verification

> **Task ID:** `TASK-POPUP-WELLNESS-HEADER-001`  
> **Phase #:** 04 of 04  
> **Target Path:** `temp_prompt/popup_wellness_header_reorg/PHASE_04_TESTING_AND_QA_VERIFICATION.md`  
> **Lead Execution Role:** Level 4 Independent QA Verification Tester Subagent  
> **Required Skills:** `python-testing`, `e2e-testing`, `security-review`  
> **Encoding Standard:** UTF-8 with BOM (`0xEF, 0xBB, 0xBF`)  

---

## 🎯 1. Phase Objective
1. Synchronize the existing test suite `tests/test_popup_2tier_navigation.js` so its DOM ordering assertions validate the new header layout (Tier 1 nav left, actions right) and footer gear placement, and include `#mainTabFocus` in the expected wellness tabs.
2. Author a brand-new, comprehensive verification test suite: `tests/test_popup_wellness_and_header_reorg.js` with 7 dedicated test batteries.
3. Execute the full project master test runner (`node run_all_tests.js`) and ensure 100% test passage across all test suites with Exit Code 0.
4. Run `gitleaks detect --redact` to confirm zero secrets/tokens are leaked.
5. Verify UTF-8 with BOM standard on all touched files.

---

## 📋 2. Prerequisites & Inputs
- Phase 01 (DOM & i18n), Phase 02 (CSS), and Phase 03 (JS Feature Engine) completed.
- Target files:
  - [`tests/test_popup_2tier_navigation.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_popup_2tier_navigation.js)
  - [`tests/test_popup_wellness_and_header_reorg.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_popup_wellness_and_header_reorg.js) (new)
  - [`run_all_tests.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/run_all_tests.js)

---

## 🛠️ 3. Surgical Step-by-Step Instructions

### Step 1: Synchronize `tests/test_popup_2tier_navigation.js`
In `tests/test_popup_2tier_navigation.js`:
1. Update lines 85-94 (DOM order assertions):
   - Previously:
     ```javascript
     const badgesIdx = html.indexOf('class="header-badges"');
     const dashIdx = html.indexOf('id="btnOpenDashboard"');
     const tier1Idx = html.indexOf('id="tier1SegmentedNav"');
     const qsIdx = html.indexOf('id="btnQuickSettings"');
     const navIdx = html.indexOf('<nav class="top-nav-tabs"');

     assert(tier1Idx > badgesIdx && tier1Idx < qsIdx, '#tier1SegmentedNav must precede #btnQuickSettings in .header-badges');
     assert(dashIdx < tier1Idx, '#btnOpenDashboard must precede #tier1SegmentedNav in .header-badges');
     assert(tier1Idx < navIdx, '#tier1SegmentedNav must precede .top-nav-tabs in DOM');
     ```
   - Update to reflect the new layout:
     ```javascript
     const badgesIdx = html.indexOf('class="header-badges"');
     const switchIdx = html.indexOf('id="btnSwitchMediaTab"');
     const dashIdx = html.indexOf('id="btnOpenDashboard"');
     const tier1Idx = html.indexOf('id="tier1SegmentedNav"');
     const footerIdx = html.indexOf('<footer');
     const qsIdx = html.indexOf('id="btnQuickSettings"');
     const themeIdx = html.indexOf('id="btnThemeToggle"');
     const navIdx = html.indexOf('<nav class="top-nav-tabs"');

     // Tier 1 Nav is aligned to the left of the header-badges cluster, preceding action buttons
     assert(tier1Idx > badgesIdx && tier1Idx < switchIdx, '#tier1SegmentedNav must precede #btnSwitchMediaTab in .header-badges');
     assert(switchIdx < dashIdx, '#btnSwitchMediaTab must precede #btnOpenDashboard');
     assert(tier1Idx < navIdx, '#tier1SegmentedNav must precede .top-nav-tabs in DOM');

     // Quick Settings is moved into footer directly preceding theme toggle
     assert(qsIdx > footerIdx && qsIdx < themeIdx, '#btnQuickSettings must be in footer preceding #btnThemeToggle');
     ```
2. In `expectedChildTabs` (around line 120), add Focus tab:
   ```javascript
   { id: 'mainTabFocus', group: 'wellness' }
   ```
3. In initial state check (around line 129), verify `mainTabFocus` is in the list of tabs with initial `tab-hidden`.
4. In `canonicalPanes`, add `'viewFocusPane'`.
5. Run `node tests/test_popup_2tier_navigation.js` and verify all 6 phases PASS cleanly.

### Step 2: Author `tests/test_popup_wellness_and_header_reorg.js`
Create a comprehensive test suite containing 7 batteries:
- **Battery 1: DOM Hierarchy & Header/Footer Layout:**
  - Verify `#tier1SegmentedNav` precedes `#btnSwitchMediaTab` and `#btnOpenDashboard` in `.header-badges`.
  - Verify `#btnQuickSettings` is inside `<footer class="footer">` directly preceding `#btnThemeToggle`.
  - Verify `#btnQuickSettings` has `type="button"`, `aria-haspopup="dialog"`, and `aria-expanded="false"`.
- **Battery 2: Wellness Sub-Tab Structure (Focus + Sleep):**
  - Verify `#mainTabFocus` exists with `data-group="wellness"` and `data-view="focus"`.
  - Verify `#mainTabSleep` exists with `data-group="wellness"` and `data-view="sleep"`.
  - Verify `#viewFocusPane` and `#viewSleepPane` exist as canonical tab panes.
  - Verify initial DOM state has `tab-hidden` on both `#mainTabSleep` and `#mainTabFocus`.
- **Battery 3: Feature Engine State Machine (`tier1_navigation_feature.js`):**
  - Verify `getTabsForGroup('wellness')` returns `['sleep', 'focus']`.
  - Verify `getGroupForTab('focus') === 'wellness'` and `getGroupForTab('sleep') === 'wellness'`.
  - Verify `isValidTab('focus') === true` and `isValidTab('sleep') === true`.
- **Battery 4: JavaScript Tab Switching & Popover Simulation:**
  - In-memory mock DOM test: simulate clicking `#tier1BtnWellness` -> both `#mainTabSleep` and `#mainTabFocus` lose `.tab-hidden`, while tabs in playback, studio, and analytics gain `.tab-hidden`.
  - Simulate clicking `#mainTabFocus` -> `#viewFocusPane` receives `.active`, `#mainTabFocus` receives `.active` and `aria-selected="true"`.
  - Simulate clicking `#btnQuickSettings` -> `#quickSettingsPopover` toggles `.hidden` class, updates `aria-expanded`.
- **Battery 5: 380px Fixed-Width Geometry & Zero-Scroll CSS:**
  - Inspect `popup/popup.css`: verify `overflow-x: hidden`, fixed width rules on `.sentinel-app` and `body`.
  - Verify `.quick-settings-popover` declares `bottom: 48px;` and `right: 8px;`.
- **Battery 6: Bilingual i18n Translation & Parity:**
  - Verify keys: `top_tab_focus`, `focus_placeholder_title`, `focus_placeholder_desc`, `focus_status_ready`.
  - Verify authentic Devanagari Hindi strings in `locales/hi.json` with zero untranslated English tokens.
- **Battery 7: W3C Trusted Types & UTF-8 with BOM Security:**
  - Scan for zero `innerHTML` or `eval` calls.
  - Verify byte order mark (`0xEF, 0xBB, 0xBF`) across all touched files.

### Step 3: Run Master Regression Suite
Execute:
```powershell
node run_all_tests.js
```
Confirm all test suites (including new suite) PASS with Exit Code 0.

### Step 4: Secret Audit & Clean Tree Proof
Execute:
```powershell
gitleaks detect --redact
```
Confirm 0 leaks detected.

---

## 🔒 4. Acceptance Criteria for QA Signoff
- [ ] `node tests/test_popup_2tier_navigation.js` passes 100%.
- [ ] `node tests/test_popup_wellness_and_header_reorg.js` passes 100%.
- [ ] `node run_all_tests.js` passes 100% across all suites (Exit Code 0).
- [ ] `gitleaks detect --redact` reports 0 findings.
- [ ] UTF-8 with BOM verified on all touched files.

---

## 📦 5. Deliverables Manifest
1. Synchronized `tests/test_popup_2tier_navigation.js`.
2. Newly created `tests/test_popup_wellness_and_header_reorg.js`.
3. Verified test logs confirming Grade A+ signoff.
