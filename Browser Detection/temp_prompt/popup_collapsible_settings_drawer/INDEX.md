# Popup Focus and Sleep Tab Collapsible Settings Drawers: Master Index & Tracking Board

> **Document Type:** Live Ephemeral Workspace Tracking Board & Problem-Solution Dossier  
> **Workspace Container:** `temp_prompt/popup_collapsible_settings_drawer/`  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Command Hierarchy Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target Subsystems:** `popup/popup.html`, `popup/popup.js`, `popup/styles/tabs/tab_sleep.css`, `popup/styles/tabs/tab_wellness.css`, `popup/popup.css`, `locales/en.json`, `locales/hi.json`, `tests/`  
> **Lead Departments:** Dept 01 (Product Requirements), Dept 04 (UI/UX Design System), Dept 05 (Frontend Engineering), Dept 08 (QA & Testing)  
> **Target Autonomy Strategy:** Strategy A (Fully Autonomous Phase-wise Execution, Score: 1.0)  

---

## 📋 1. Executive Problem-Solution Dossier

### 1.1 Current Architectural Limitations
1. **Vertical Stacking & Excessive Scroll Clutter:**
   In both `#viewSleepPane` (Sleep Tab) and `#viewFocusPane` (Focus Tab), primary dials and secondary settings (presets grid, custom inputs, automation toggles, ratio bars, doomscroll breaker) are stacked linearly. This results in content heights exceeding 700px–850px, forcing vertical scrolling within the compact extension popup window (standard max-height ~550px–580px).
2. **Diluted Hero Interaction:**
   Users opening the popup primarily want instant visibility of their active countdown dial, status, and quick extend/toggle actions. Secondary controls and configuration toggles compete for visual attention in the initial viewport.
3. **Absence of Collapsible State Management:**
   There is currently no unified, accessible accordion or collapsible drawer pattern in the popup panes. Existing controls lack `aria-expanded` and `aria-controls` attributes for expandable settings.
4. **Strict Architectural Safeguard Requirements:**
   Existing regression suites (102 test files) assert the presence of critical DOM IDs (`#cardSleepHeroRing`, `#cardSleepPresetsAndCustom`, `#cardSleepAutomations`, `#cardPopupFocusTimer`, `#cardFocusPresetsAndCustom`, `#focusRatioBarContainer`, `#doomscrollBreakerCard`). Any refactor must strictly preserve all element IDs, hierarchies, and event listener attachments while introducing zero-scroll drawers.

### 1.2 The Architectural Solution
1. **Phase 1: Markup Architecture & Semantic Drawer Structure (`popup/popup.html`, `locales/*.json`):**
   Wrap secondary settings sections in semantic collapsible drawer containers with accessible header buttons (`<button class="drawer-toggle-btn" aria-expanded="false">`). Add bilingual translation keys to `locales/en.json` and `locales/hi.json` with 100% key parity. Strictly preserve all existing IDs, child components, and data attributes.
2. **Phase 2: CSS Zero-Scroll Layout & Hardware-Accelerated Smooth Transitions (`popup/popup.css`, `tab_sleep.css`, `tab_wellness.css`):**
   Implement CSS Grid transition technique (`grid-template-rows: 0fr -> 1fr`) for seamless 60fps micro-motion expansion and collapse without layout jitter or fixed height limits. Constrain default popup pane height to ensure zero vertical scrollbar in the initial collapsed state. Style cyber-dark and light mode drawer cards with sleek borders, gradients, and rotating chevrons.
3. **Phase 3: JavaScript Drawer State Machine, Local Storage Persistence & W3C Trusted Types (`popup/popup.js`):**
   Attach resilient click event listeners to toggle drawer states. Persist open/closed preferences in `chrome.storage.local` so user preferences survive popup re-opens. Enforce W3C Trusted Types zero-innerHTML safety using `setAttribute` and class toggles. Restrict function lengths to <= 50 lines per Universal Rule 28.
4. **Phase 4: Comprehensive QA Test Battery & Master Regression Certification (`tests/`):**
   Author standalone verification test suite `tests/test_popup_collapsible_settings_drawers.js` testing DOM presence, ARIA attributes, toggle dynamics, CSS properties, i18n parity, and run all 102 test suites cleanly (Exit Code 0), followed by a zero-leak `gitleaks` audit.

---

## 🚦 2. Phase Execution Status Checklist

| Phase # | Phase Name | Target File(s) | Primary Subagent Role | Gate Verification Command | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **01** | Semantic Drawer Markup & Bilingual i18n Integration | `popup/popup.html`<br>`locales/en.json`<br>`locales/hi.json` | Level 4 Frontend Engineer | `node -e "/* verify DOM IDs and i18n keys */"` | ⏳ READY |
| **02** | CSS Zero-Scroll Layout & Smooth Grid Transitions | `popup/styles/tabs/tab_sleep.css`<br>`popup/styles/tabs/tab_wellness.css`<br>`popup/popup.css` | Level 4 Frontend Engineer | `node -e "/* verify CSS selectors and syntax */"` | ⏳ READY |
| **03** | JS Drawer State Machine, Storage Persistence & Trusted Types | `popup/popup.js` | Level 4 Frontend Engineer | `node -e "/* syntax and event check */"` | ⏳ READY |
| **04** | Independent QA Test Battery, Regression & Security Gate | `tests/test_popup_collapsible_settings_drawers.js`<br>`run_all_tests.js` | Level 4 QA Verification Tester | `node tests/test_popup_collapsible_settings_drawers.js`<br>`node run_all_tests.js` | ⏳ READY |

---

## 📊 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | `popup/popup.html` | Secondary cards in `#viewSleepPane` and `#viewFocusPane` are permanently expanded in linear DOM flow, forcing popup vertical scrolling. | Wrap secondary cards in collapsible drawer containers with accessible `<button class="drawer-toggle-btn" aria-expanded="false">`. | Clean zero-scroll primary view on launch while keeping secondary settings 1 click away. | Phase 1 | Node DOM ID presence verification |
| **2** | `locales/en.json` & `locales/hi.json` | Lack of dedicated localization keys for collapsible settings drawer headers, expand/collapse tooltips. | Add bilingual keys (`drawer_settings_title`, `drawer_expand_tooltip`, `drawer_collapse_tooltip`) with exact key parity. | Seamless bilingual support across English and Hindi locales. | Phase 1 | Node i18n parity check |
| **3** | `popup/styles/tabs/tab_sleep.css` | Linear card layout in Sleep tab lacks accordion/drawer grid transition rules and collapsed state styles. | Implement `grid-template-rows: 0fr -> 1fr` transition with `overflow: hidden` and chevron rotation transforms. | 60fps smooth animation without layout jump; cyber-dark glassmorphism aesthetics. | Phase 2 | CSS syntax & selector test |
| **4** | `popup/styles/tabs/tab_wellness.css` | Multiple stacked cards in Focus tab exceed viewport height without overflow or drawer collapse support. | Add matching collapsible drawer layout classes and zero-scroll primary card height constraints. | Consistent UX between Focus and Sleep tabs; zero unwanted scrollbars. | Phase 2 | CSS syntax & selector test |
| **5** | `popup/popup.js` | No event listeners or state machine to toggle drawer open/closed states or sync `aria-expanded`. | Implement modular `initCollapsibleDrawers()` helper (<= 50 lines) with `chrome.storage.local` persistence. | User drawer preferences are remembered across popup openings; 100% W3C Trusted Types compliant. | Phase 3 | JavaScript syntax check |
| **6** | `tests/test_popup_collapsible_settings_drawers.js` | Missing automated test suite asserting zero-scroll drawer structure, DOM ID preservation, and ARIA state. | Author dedicated standalone 6-battery test suite verifying IDs, ARIA, CSS classes, storage keys, and i18n. | Grade A+ automated test coverage, regression immunity. | Phase 4 | Exit Code 0 with raw terminal output |
