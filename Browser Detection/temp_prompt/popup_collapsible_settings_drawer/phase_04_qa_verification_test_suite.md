# Phase 4: Comprehensive QA Test Battery, Regression & Security Gate

> **Phase Identifier:** `phase_04_qa_verification_test_suite`  
> **Target Subsystems:** `tests/test_popup_collapsible_settings_drawers.js`, `run_all_tests.js`  
> **Primary Subagent Role:** Level 4 QA Verification Tester  
> **Lead Department:** Dept 08: Quality Assurance & Testing & Dept 10: AppSec  

---

## 🎯 1. Phase Objective
Develop a dedicated, standalone 6-battery test suite `tests/test_popup_collapsible_settings_drawers.js` certifying the DOM structure, ARIA accessibility, CSS transition contracts, JavaScript state toggling, storage keys, and bilingual i18n parity of the collapsible settings drawers. Run the complete master test runner (`node run_all_tests.js`) to guarantee 100% regression immunity across all 102+ test suites, followed by a zero-leak `gitleaks` secret audit.

---

## 📋 2. Prerequisites & Dependencies
- Phases 1, 2, and 3 are implemented.
- Target test file to create:
  - `tests/test_popup_collapsible_settings_drawers.js`

---

## 🧪 3. Test Suite Battery Specifications

### Battery 1: Popup HTML DOM Hierarchy & ID Preservation
- Assert `#sleepSettingsDrawer` exists inside `#viewSleepPane`.
- Assert `#btnToggleSleepSettingsDrawer` has `aria-expanded="false"`, `aria-controls="sleepSettingsDrawerBody"`.
- Assert `#sleepSettingsDrawerBody` has `role="region"`.
- Assert `#cardSleepPresetsAndCustom` and `#cardSleepAutomations` are contained inside `#sleepSettingsDrawerBody`.
- Assert `#focusSettingsDrawer` exists inside `#viewFocusPane`.
- Assert `#btnToggleFocusSettingsDrawer` has `aria-expanded="false"`, `aria-controls="focusSettingsDrawerBody"`.
- Assert `#cardFocusPresetsAndCustom`, `#focusRatioBarContainer`, and `#doomscrollBreakerCard` are contained inside `#focusSettingsDrawerBody`.

### Battery 2: CSS Transition & Styling Rules
- Assert `.popup-settings-drawer` defines modern rounded borders and dark glassmorphic backgrounds.
- Assert `.drawer-expandable-wrap` defines `grid-template-rows: 0fr` with cubic-bezier transition.
- Assert `.popup-settings-drawer.open .drawer-expandable-wrap` defines `grid-template-rows: 1fr`.
- Assert `.drawer-chevron` defines 180deg rotation when `.popup-settings-drawer.open`.

### Battery 3: JavaScript Drawer State Machine & Event Listeners
- Assert `initCollapsibleDrawer` helper is defined in `popup/popup.js`.
- Assert storage keys `sleepSettingsDrawerOpen` and `focusSettingsDrawerOpen` are wired to get/set.
- Assert click listener toggles `open` class and updates `aria-expanded` dynamically.
- Assert zero `innerHTML` usage in drawer logic (100% W3C Trusted Types safe).

### Battery 4: Bilingual Localization Parity
- Assert `locales/en.json` and `locales/hi.json` contain matching keys for `sleep_drawer_title` and `focus_drawer_title`.
- Assert total key counts between `en.json` and `hi.json` remain identical.

### Battery 5: Function Length & Modularity Compliance (Rule 28)
- Assert all newly introduced functions in `popup/popup.js` are <= 50 lines.
- Assert maximum nesting depth <= 3.

### Battery 6: Master Regression & AppSec Scan
- Execute `node run_all_tests.js`: 100% pass across all 102+ suites (Exit Code 0).
- Execute `gitleaks detect --redact`: 0 leaks detected.

---

## 🛡️ 4. Constraints & Boundaries
- Test must run cleanly in Node.js environment without external server dependencies.
- Grade A+ signoff requires exit code 0 on both standalone suite and master regression runner.
- Maintain UTF-8 with BOM standard.

---

## 📦 5. Expected Deliverables
- Created `tests/test_popup_collapsible_settings_drawers.js`
- Clean execution log proving 100% test passage

---

## 🚦 6. Verification Gate
```bash
node tests/test_popup_collapsible_settings_drawers.js
node run_all_tests.js
```
