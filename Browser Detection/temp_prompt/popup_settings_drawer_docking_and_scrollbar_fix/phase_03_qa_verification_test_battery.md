# Phase 03: Comprehensive QA Verification Test Battery & Regression Gate

> **Phase Number:** 03  
> **Phase Target:** `tests/test_popup_drawer_docking_and_scrollbar_fix.js`, `run_all_tests.js`  
> **Executing Role:** Level 4 QA Verification Tester  
> **Governing Standards:** Universal Rule 15, Rule 27, Grade A+ Certification  

---

## 🎯 Phase Objective
1. Author standalone test suite `tests/test_popup_drawer_docking_and_scrollbar_fix.js` covering 5 rigorous batteries.
2. Certify that all 102+ test suites in `node run_all_tests.js` pass 100% clean with Exit Code 0.
3. Validate 0 secret leaks via `gitleaks detect --redact`.
4. Validate 100% UTF-8 with BOM integrity across all touched files.

---

## 🧪 Test Battery Specifications

### Battery 1: Sleep Tab Docked Hero & Bounded Drawer
- Assert `.sleep-hero-card` has `flex-shrink: 0`.
- Assert `#sleepSettingsDrawer.open .drawer-inner-content` has `overflow-y: auto` and bounded `max-height`.
- Assert `#viewSleepPane` prevents parent scroll displacement.

### Battery 2: Focus Tab WebKit Custom Scrollbar
- Assert `#viewFocusPane::-webkit-scrollbar` is defined with width <= 5px.
- Assert custom thumb and track rules exist.
- Assert `scrollbar-color` is defined for W3C Firefox/standards compliance.

### Battery 3: Compact Spacing & Geometry
- Assert reduced gap/padding rules on Focus drawer inner content.
- Assert no visual truncation or horizontal overflow.

### Battery 4: Regression Compatibility
- Run `node tests/test_popup_collapsible_settings_drawer.js` to guarantee existing drawer tests remain 100% green.
- Run `node run_all_tests.js` to guarantee 0 regressions across all 102 suites.

### Battery 5: Security & Encoding
- 0 innerHTML violations.
- 100% UTF-8 with BOM certified on all touched files.
- `gitleaks detect --redact` 0 leaks detected.

---

## 🏆 Signoff Criteria
- Standalone test suite passes 100% (Exit Code 0).
- Master test runner passes 102/102 clean.
- Gitleaks reports 0 leaks.
