# Phase 04: Popup JavaScript Slimming & Module Expansion

> **Task ID:** TASK-MODULAR-SPLIT-006-P04  
> **Specialist Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target Agent Role:** Level 4 Frontend Engineer (`frontend_engineer`)  
> **Target Files:** [`popup/popup.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js), [`src/popup/**`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/popup)  
> **Prerequisites:** Phase 01, Phase 02, and Phase 03 completed and verified  
> **Status:** READY FOR LEVEL 4 SUBAGENT DISPATCH  

---

## 🎯 1. Phase Objective
Deconstruct the monolithic inline logic in `popup/popup.js` (currently 4,195 lines) into its respective tab controllers and service modules in `src/popup/` and slim `popup/popup.js` into a lightweight, elegant facade (< 300 lines). Ensure flawless 6-tab navigation, balanced brace AST integrity (preventing Bug 804:1), zero `innerHTML` Trusted Types safety, high-precision donut chart rendering, and SQLite Data Hub sync preservation.

---

## 📂 2. Target File Map & Line Anchors

- **Root Facade:** `popup/popup.js` (Lines 1-4195)
- **Modular Subsystems:**
  - `src/popup/state/popup_state.js` (Popup active tab, media cache, settings)
  - `src/popup/services/ipc_service.js` (Runtime & tab messaging with background)
  - `src/popup/services/storage_service.js` (Local storage preferences)
  - `src/popup/services/data_hub_service.js` (WebSocket & SQLite Data Hub sync)
  - `src/popup/tabs/tab_quick.js` (Quick Settings tab controller)
  - `src/popup/tabs/tab_media.js` (Media Sentinel tab controller)
  - `src/popup/tabs/tab_automations.js` (Smart Automations tab controller)
  - `src/popup/tabs/tab_wellness.js` (Digital Wellness alarms tab controller)
  - `src/popup/tabs/tab_studio.js` (Studio Vault presets tab controller)
  - `src/popup/tabs/tab_audio.js` (Audio Lab & DSP equalizer controller)
  - `src/popup/components/header_badges.js` (Connection & status pills)
  - `src/popup/components/footer_toolbar.js` (Pause/Resume toolbar)
  - `src/popup/components/stats_pills.js` (Time tracked, active tabs count)

---

## 🛠️ 3. Surgical Step-by-Step Instructions

1. **Verify Modules in `src/popup/`:**
   Inspect each tab controller in `src/popup/tabs/` to confirm that tab-specific event listeners, DOM query selectors, and rendering functions are complete.
2. **Implement Universal Facade in `popup/popup.js`:**
   - Resolve modules via `typeof require === 'function' ? require('./src/...') : null` with global namespace fallback for the browser.
   - Maintain global helper methods expected by test suites:
     - `processDomainStats()`
     - `renderDonutChart()`
     - `formatTime()` (delegates to `src/shared/formatters.js`)
     - `switchTab()`
3. **Slim `popup/popup.js`:**
   - Delegate tab switching to `src/popup/state/popup_state.js` and individual tab controllers.
   - Delegate footer pause toolbar rendering to `src/popup/components/footer_toolbar.js`.
   - Delegate status badges to `src/popup/components/header_badges.js`.
   - Delegate SQLite sync triggers to `src/popup/services/data_hub_service.js`.
   - Reduce total line count from 4,195 lines to under 350 lines.
4. **Enforce Balanced Braces & AST Integrity:**
   Ensure zero dangling closing braces or unmatched brackets (must pass Test 3 in `test_syntax_and_manifest_integrity.js`).
5. **Verify UTF-8 BOM:**
   Ensure `popup/popup.js` is saved with UTF-8 BOM (`0xEF, 0xBB, 0xBF`).

---

## 🚫 4. Architectural Constraints & Out-of-Scope Boundaries

- **DO NOT** break the 380px x 600px popup viewport bounds.
- **DO NOT** use `innerHTML` in tab views or toolbar components.
- **DO NOT** alter the 6-tab tablist ID or class bindings (`#tabQuick`, `#tabMedia`, etc.).

---

## 🧪 5. Local Verification Gate

Run the following test suites to verify Phase 04 completion:
```bash
node tests/test_syntax_and_manifest_integrity.js
node tests/test_popup_formattime_resolution.js
node tests/test_six_tab_popup_architecture.js
node tests/test_popup_phase1_quick_settings.js
node tests/test_popup_phase2_smart_automations.js
node tests/test_popup_phase3_digital_wellness_alarms.js
node tests/test_popup_phase4_studio_vault.js
node tests/test_popup_phase5_audio_lab_and_dsp.js
node tests/test_popup_sqlite_data_hub_sync.js
```
**Gate Requirement:** All 9 popup test suites must pass with 100% exit code 0.
