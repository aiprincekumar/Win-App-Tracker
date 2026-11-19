# Popup Settings Drawers Docking and Cyber Scrollbars: Master Index and Tracking Board

> **Document Type:** Live Ephemeral Workspace Tracking Board & Problem-Solution Dossier  
> **Workspace Container:** `temp_prompt/popup_settings_drawer_docking_and_scrollbar_fix/`  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Command Hierarchy Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target Subsystems:** `popup/styles/tabs/tab_sleep.css`, `popup/styles/tabs/tab_wellness.css`, `popup/popup.css`, `popup/popup.html`, `tests/`  
> **Lead Departments:** Dept 01 (Product Requirements), Dept 04 (UI/UX Design System), Dept 05 (Frontend Engineering), Dept 08 (QA & Testing)  
> **Target Autonomy Strategy:** Strategy A (Fully Autonomous Phase-wise Execution, Score: 1.0)  

---

## 📋 1. Executive Problem-Solution Dossier

### 1.1 Current Architectural Defects
1. **Sleep Tab Hero Ring & Controls Displacement:**
   - In `#viewSleepPane`, opening the collapsible settings drawer causes the entire view pane to scroll (`overflow-y: auto` on parent `#viewSleepPane`). When users scroll through presets or automation toggles, the primary hero dial (`#cardSleepHeroRing`), countdown clock, and main action controls scroll off-screen, disconnecting the user from active timer telemetry.
2. **Focus Tab Native OS Scrollbar Leakage:**
   - On Windows Chrome / Edge extension popups, `#viewFocusPane` relies on basic `scrollbar-width: thin;` without explicit WebKit custom scrollbar styling (`::-webkit-scrollbar`, `::-webkit-scrollbar-thumb`, `::-webkit-scrollbar-track`). This results in an intrusive, wide gray native Windows scrollbar breaking the sleek cyber-dark glassmorphism design.
3. **Focus Tab Spacing Bloat:**
   - Spacing within `#focusSettingsDrawerBody` and `.drawer-inner-content` contains excess vertical padding and card gaps, pushing content beyond the ideal 380px extension popup viewport height.

### 1.2 The Architectural Solution
1. **Phase 1: Sleep Tab Docked Hero Ring & Bounded Scrollable Drawer (`popup/styles/tabs/tab_sleep.css`, `popup/popup.css`):**
   - Dock `#cardSleepHeroRing` as a rigid, non-scrolling flex header (`flex-shrink: 0;`).
   - Confine vertical scrolling strictly to `#sleepSettingsDrawer .drawer-inner-content` (or `.drawer-expandable-wrap`), with `overflow-y: auto`, `max-height: 280px` (or flexible remaining height), and `flex: 1; min-height: 0;`.
   - Prevent `#viewSleepPane` from scrolling away the hero dial.
2. **Phase 2: Focus Tab Custom Cyber-Dark Sleek Scrollbar & Compact Spacing (`popup/styles/tabs/tab_wellness.css`, `popup/popup.css`):**
   - Implement custom WebKit scrollbar rules for `#viewFocusPane` and `#focusSettingsDrawer .drawer-inner-content` (`width: 4px;`, cyan/slate thumb gradient, transparent track, 4px border radius).
   - Add W3C standard `scrollbar-width: thin; scrollbar-color: rgba(6, 182, 212, 0.45) transparent;`.
   - Add matching sleek scrollbar rules to Sleep Tab drawer container (`scrollbar-color: rgba(129, 140, 248, 0.45) transparent;`).
   - Compress internal padding and gaps to provide an ultra-clean, compact ergonomic layout.
3. **Phase 3: QA Verification, Visual Assertions & Master Regression Certification (`tests/`):**
   - Author dedicated standalone test suite `tests/test_popup_drawer_docking_and_scrollbar_fix.js` validating CSS properties, scrollbar selectors, DOM preservation, and backward compatibility.
   - Run complete test battery (all 102+ test suites via `node run_all_tests.js`) with 100% PASS, Exit Code 0.
   - Run `gitleaks detect --redact` secret scan verifying 0 leaks.

---

## 🚦 2. Phase Execution Status Checklist

| Phase # | Phase Name | Target File(s) | Primary Subagent Role | Gate Verification Command | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **01** | Sleep Tab Docked Hero & Bounded Scrollable Drawer | `popup/styles/tabs/tab_sleep.css`<br>`popup/popup.css` | Level 4 Frontend Engineer | `node -e "/* verify sleep dock and scroll styles */"` | ⏳ READY |
| **02** | Focus Tab Custom Sleek Scrollbar & Compact Spacing | `popup/styles/tabs/tab_wellness.css`<br>`popup/popup.css` | Level 4 Frontend Engineer | `node -e "/* verify webkit scrollbar and spacing */"` | ⏳ READY |
| **03** | QA Verification Test Battery & Master Regression | `tests/test_popup_drawer_docking_and_scrollbar_fix.js`<br>`run_all_tests.js` | Level 4 QA Verification Tester | `node tests/test_popup_drawer_docking_and_scrollbar_fix.js`<br>`node run_all_tests.js` | ⏳ READY |

---

## 📊 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | `popup/styles/tabs/tab_sleep.css` | `#viewSleepPane` has `overflow-y: auto` on the parent pane, causing the hero dial to scroll out of view when settings drawer expands. | Make `#cardSleepHeroRing` non-scrolling (`flex-shrink: 0`), bind scrolling strictly inside `#sleepSettingsDrawer .drawer-inner-content` (`overflow-y: auto; max-height: 280px;`). | Hero dial and action controls remain permanently pinned in viewport; drawer scrolls smoothly within its own boundary. | Phase 1 | Node CSS assertions |
| **2** | `popup/styles/tabs/tab_wellness.css` | `#viewFocusPane` lacks WebKit scrollbar pseudo-elements, triggering native Windows wide gray scrollbars. | Add `::-webkit-scrollbar` (width: 4px), `::-webkit-scrollbar-thumb` (cyber-cyan/slate), transparent track, and `scrollbar-color`. | Complete elimination of native OS scrollbar; high-end cyber-dark aesthetic. | Phase 2 | Node CSS assertions |
| **3** | `popup/styles/tabs/tab_wellness.css` | Focus settings drawer contains excess padding and card gaps, causing unnecessary vertical overflow. | Compact inner card margins and drawer gaps to 6px; optimize presets grid padding. | Compact, balanced vertical layout fitting comfortably in standard popup bounds. | Phase 2 | Node CSS assertions |
| **4** | `popup/popup.css` | Generic drawer rules apply `overflow-y: auto` to pane parents without dedicated drawer body scroll bounding. | Ensure drawer body inner container handles internal bounded overflow while keeping pane constraint intact. | Universal stability across all popup drawers. | Phase 1 & 2 | Node CSS assertions |
| **5** | `tests/test_popup_drawer_docking_and_scrollbar_fix.js` | Missing dedicated regression test suite asserting docked hero flex properties, WebKit scrollbar rules, and compact spacing. | Author comprehensive standalone 5-battery test suite. | Prevents regressions, certifies Grade A+ test coverage with Exit Code 0. | Phase 3 | `node tests/test_popup_drawer_docking_and_scrollbar_fix.js` |
