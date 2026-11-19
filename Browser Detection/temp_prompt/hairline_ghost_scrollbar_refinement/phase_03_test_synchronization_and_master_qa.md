# Phase 3: Test Synchronization & Master QA Certification

> **Document Type:** Phase Execution Prompt  
> **Workspace Container:** `temp_prompt/hairline_ghost_scrollbar_refinement/`  
> **Phase Number:** 03 of 03  
> **Assigned Subagent Role:** Level 4 QA Verification Tester  
> **Target Files:** `tests/test_popup_drawer_docking_and_scrollbar_fix.js`, `tests/test_popup_collapsible_settings_drawer.js`, `run_all_tests.js`  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  

---

## 🎯 1. Phase Objective
Synchronize the standalone automated test suite `tests/test_popup_drawer_docking_and_scrollbar_fix.js` to assert the 2px hairline geometry and subtle ghost color tokens across all test batteries, execute standalone verification suites, run the complete master test suite (`node run_all_tests.js`), and certify 100% test passage, UTF-8 with BOM integrity, and zero security leaks.

---

## 📋 2. Prerequisites & File Anchors
- **Prerequisites:** Phase 1 (`popup/popup.css`) and Phase 2 (`tab_sleep.css`, `tab_wellness.css`) completed.
- **File Anchors in `tests/test_popup_drawer_docking_and_scrollbar_fix.js`:**
  - Lines ~130-155: Universal `popup.css` scrollbars Battery 3 assertions (`scrollbar-width`, `scrollbar-color`, `width: 2px;`, `height: 2px;`, `background: transparent;`, `border-radius: 999px;`).
  - Lines ~157-167: Tab Sleep specific scrollbar assertions (WebKit rules, ghost indigo color `rgba(129, 140, 248, 0.28)`).
  - Lines ~168-178: Tab Wellness/Focus specific scrollbar assertions (WebKit rules, ghost cyan color `rgba(6, 182, 212, 0.28)`).
  - Lines ~179-192: Light theme scrollbar support assertions (`popup.css`, `tab_sleep.css`, `tab_wellness.css`).

---

## 🛠️ 3. Surgical Implementation Instructions

1. **Battery 3 Assertions Update in `tests/test_popup_drawer_docking_and_scrollbar_fix.js`:**
   - Update `popup.css` dark mode `scrollbar-color` assertion to check `rgba(255, 255, 255, 0.12) transparent;`.
   - Update `popup.css` WebKit width/height check from `width: 4px;` to:
     ```javascript
     assert.ok(
       popupCss.includes('width: 2px;') && popupCss.includes('height: 2px;'),
       'popup.css must set sleek 2px hairline scrollbar width/height'
     );
     ```
   - Update thumb background check to `rgba(255, 255, 255, 0.12);`.
   - Update sleep CSS thumb color assertion to check `rgba(129, 140, 248, 0.28)`.
   - Update wellness CSS thumb color assertion to check `rgba(6, 182, 212, 0.28)`.
   - Update light theme scrollbar assertions to match updated ghost colors (`rgba(0, 0, 0, 0.12)`, `rgba(99, 102, 241, 0.25)`, `rgba(15, 118, 110, 0.22)`).

2. **Run Standalone Verification Suites:**
   - Run `node tests/test_popup_drawer_docking_and_scrollbar_fix.js` -> Must pass 5/5 batteries (Exit Code 0).
   - Run `node tests/test_popup_collapsible_settings_drawer.js` -> Must pass 5/5 batteries (Exit Code 0).

3. **Master Regression Test Suite:**
   - Run `node run_all_tests.js` -> Must execute all 99+ test suites with 0 failures (Exit Code 0).

4. **Encoding & Security Verification:**
   - Verify 100% UTF-8 with BOM on all touched files.
   - Run `gitleaks detect --redact` to confirm 0 secret leaks.

---

## 🚫 4. Architectural Constraints & Boundaries
- Do NOT weaken test assertions; maintain strict, non-trivial string and regex property validations.
- Do NOT disable or skip any batteries in `tests/test_popup_drawer_docking_and_scrollbar_fix.js` or `run_all_tests.js`.

---

## 📦 5. Deliverables Manifest
- Updated `tests/test_popup_drawer_docking_and_scrollbar_fix.js`.
- Terminal logs confirming 100% clean test passes across standalone and master test runners.
- Gitleaks report confirming 0 leaks.

---

## 🔍 6. Local Verification Gate
```bash
node tests/test_popup_drawer_docking_and_scrollbar_fix.js
node tests/test_popup_collapsible_settings_drawer.js
node run_all_tests.js
```
All commands must exit with code 0.
