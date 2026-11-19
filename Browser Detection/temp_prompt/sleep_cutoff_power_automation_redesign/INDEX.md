# Live Tracking Board: Sleep Cutoff Sentinel & Power Automation Redesign

> **Authoritative Specification & Governance:**
> - **Task Identifier:** `TASK-SLEEP-POWER-AUTOMATION-REDESIGN-001`
> - **Specialist Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)
> - **Architecture Specification:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)
> - **Command Hierarchy:** [`architecture_recommendation.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/architecture_recommendation.md)
> - **Active Working Memory:** [`memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md)
> - **Execution Strategy:** Strategy A (`STRATEGY_A_AUTONOMOUS`) | Autonomy Score: 1.0

---

## 📋 1. Executive Problem-Solution Dossier

### Problem Statement
The "Sleep Cutoff Sentinel & Power Automation" section (`#widgetSleepAdvancedAutomation`) in `dashboard/dashboard.html` currently uses an asymmetric layout: an uneven two-column panel (`controls-2col-grid` with 4 items on the left and 3 on the right) paired with a bottom full-span grouping (`dash-advanced-toggles-grid` with 3 items). In contrast, the newly redesigned Focus Settings section (`widgetFocusAdvanced`) employs an ergonomic, balanced 2-column grid (`dash-focus-toggles-container` with `.dash-focus-toggle-row` cards) featuring medium-compact card sizing, cyber-dark glass styling, modern switch toggles (`<label class="switch-toggle">` + `<input type="checkbox" role="switch" class="switch-input">` + `<span class="slider-round"></span>`), subtle hover elevation, and clean typography. The sleep power automation section needs to be redesigned to achieve visual parity, ergonomic elegance, and layout consistency with Focus Settings.

### Proposed Solution
1. **CSS Grid & Card Ergonomics:** Introduce `.dash-sleep-toggles-container` and `.dash-sleep-toggle-row` (with `.dash-sleep-select-row` for dropdown integration) in `dashboard/styles/wellbeing_blacklist.css` and mirror into `dashboard/styles/focus_sleep_advanced.css` and `dashboard/dashboard.css`.
2. **DOM Restructuring:** Restructure the inner body of `#widgetSleepAdvancedAutomation` into a balanced 2-column grid with 10 interactive cards (5 balanced rows of 2 toggle cards).
3. **Control Integrity:** Preserve all existing input IDs, event listeners, storage synchronization keys, accessibility attributes (`role="switch"`, `aria-label`), and bilingual i18n data bindings.
4. **Ergonomic Select Integration:** Seamlessly integrate the `selectDashSleepTimeoutAction` dropdown within a dedicated card styled identically to toggle cards, maintaining vertical rhythm and height parity.
5. **Deterministic Verification:** Execute existing regression test suites and provide a dedicated test suite verifying the 2-column grid, toggle switch components, and zero-regression status.

---

## 🚦 2. Phase Status Checklist

| Phase # | Phase Name | Target File(s) | Status | Assigned Sub-Agent | QA Verification Signoff |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | CSS Architecture & Design Tokens | `dashboard/styles/wellbeing_blacklist.css`, `dashboard/styles/focus_sleep_advanced.css`, `dashboard/dashboard.css` | `PENDING_AUTHORIZATION` | Level 4 Frontend Engineer | Pending QA Audit |
| **Phase 2** | HTML DOM Restructuring | `dashboard/dashboard.html` | `PENDING_AUTHORIZATION` | Level 4 Frontend Engineer | Pending QA Audit |
| **Phase 3** | Verification Test Suite & QA Signoff | `tests/test_sleep_cutoff_power_automation_redesign.js`, `tests/test_ui_container_split_focus_sleep.js` | `PENDING_AUTHORIZATION` | Level 4 QA Verification Subagent | Pending QA Audit |

---

## 🔬 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `dashboard/styles/wellbeing_blacklist.css` | Sleep automation section lacks modern 2-column grid and medium-compact toggle card classes matching Focus Settings | Define `.dash-sleep-toggles-container`, `.dash-sleep-toggle-row`, and `.dash-sleep-select-row` with 52px min-height and cyber-dark styling | Establishes reusable, responsive CSS rules without altering existing component tokens | Phase 1 | `node tests/test_ui_container_split_focus_sleep.js` |
| 2 | `dashboard/styles/focus_sleep_advanced.css` | Shared advanced styles must reflect new sleep toggle classes and prevent selector collisions | Ensure `.dash-sleep-toggles-container` and select dropdown styling are declared and aligned | Guarantees modular styling whether loaded independently or via aggregate stylesheet | Phase 1 | `node tests/test_dashboard_sleep_pause_and_parity.js` |
| 3 | `dashboard/dashboard.html` | Asymmetric 4+3+3 DOM structure inside `#widgetSleepAdvancedAutomation` creates visual clutter | Refactor inner body into a single `.dash-sleep-toggles-container` with 10 cards (5x2 grid) | Polished, balanced cyber-dark layout matching Focus Settings; preserves 100% of IDs and attributes | Phase 2 | `node tests/test_dashboard_sleep_pause_and_parity.js` |
| 4 | `tests/test_sleep_cutoff_power_automation_redesign.js` | Automated verification needed for the new 2-column grid, toggle classes, and all 10 controls | Author comprehensive test suite validating DOM structure, CSS rules, switch roles, and UTF-8 BOM | Ensures Grade A+ quality gate and prevents regressions across future updates | Phase 3 | `node tests/test_sleep_cutoff_power_automation_redesign.js` |

---

## 🛡️ 4. Architectural Boundaries & Non-Negotiables
- **Level 1 CEO & Level 2 Manager Zero-Code Invariant:** All modifications must be authored by Level 4 Execution Sub-Agents upon receiving `AUTH-MGR-*` token from Level 2 Manager.
- **UTF-8 with BOM Standard:** All modified HTML, CSS, and JS files must retain `0xEF, 0xBB, 0xBF` encoding.
- **W3C Trusted Types Compliance:** 100% zero-`innerHTML` compliance. No inline style overrides breaking stylesheet encapsulation.
- **Strict ID Preservation:** The following 10 IDs must remain exactly intact:
  1. `#toggleDashSleepEndOfVideo`
  2. `#toggleSleepAutoplayBlock`
  3. `#toggleDashSleepInactivity`
  4. `#toggleSleepInactivityFastCutoff`
  5. `#selectDashSleepTimeoutAction`
  6. `#toggleSleepScreenDimmer`
  7. `#toggleSleepTabHibernate`
  8. `#toggleSleepCloseAllMediaTabs`
  9. `#toggleSleepDarkenDisplay`
  10. `#toggleSleepSystemInactivitySync`
