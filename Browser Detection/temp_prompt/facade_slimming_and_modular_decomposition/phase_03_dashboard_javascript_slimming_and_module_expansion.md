# Phase 03: Dashboard JavaScript Slimming & Module Expansion

> **Task ID:** TASK-MODULAR-SPLIT-006-P03  
> **Specialist Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target Agent Role:** Level 4 Frontend Systems Engineer (`frontend_systems_engineer`)  
> **Target Files:** [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js), [`src/dashboard/**`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard)  
> **Prerequisites:** Phase 01 and Phase 02 completed and verified  
> **Status:** READY FOR LEVEL 4 SUBAGENT DISPATCH  

---

## 🎯 1. Phase Objective
Decompose the monolithic inline blocks inside `dashboard/dashboard.js` (currently 6,335 lines) into their respective domain modules under `src/dashboard/` and transform `dashboard/dashboard.js` into a clean, lightweight facade (< 350 lines). Ensure that charting, audio DSP lab, browser filtering, RFC 4180 CSV export, omni command palette, kinetic scrubber, and table rendering are fully encapsulated in modular components while preserving all global test harnesses and UI event linkages.

---

## 📂 2. Target File Map & Line Anchors

- **Root Facade:** `dashboard/dashboard.js` (Lines 1-6335)
- **Modular Subsystems:**
  - `src/dashboard/state/dashboard_state.js` (State store, selected filters, active domain)
  - `src/dashboard/services/analytics_service.js` (Aggregations, domain metrics, hourly stats)
  - `src/dashboard/services/csv_exporter.js` (RFC 4180 compliant CSV generator)
  - `src/dashboard/charts/donut_chart.js` (Donut visualization engine)
  - `src/dashboard/charts/time_series_chart.js` (24h timeline area chart)
  - `src/dashboard/components/domain_table.js` (Domain list & sortable table)
  - `src/dashboard/filters/browser_filter.js` (Browser selection filter pills)
  - `src/dashboard/audio/audio_lab_controller.js` (Equalizer DSP, presets, visualizer canvas)
  - `src/dashboard/palette/omni_palette.js` (Command palette modal Ctrl+K)
  - `src/dashboard/scrubber/scrubber.js` (Unified timeline scrubber & kinetic rollers)

---

## 🛠️ 3. Surgical Step-by-Step Instructions

1. **Verify Modules in `src/dashboard/`:**
   Ensure each modular file in `src/dashboard/` has complete implementations of its respective controllers and exports functions matching the legacy dashboard API.
2. **Implement Universal Facade in `dashboard/dashboard.js`:**
   - Establish module resolution for `src/dashboard/*` supporting both Node.js `require` and browser script execution.
   - Bind global facades to `window` / `globalThis` (e.g. `window.SentinelDashboard = { ... }`, `window.SentinelAudioLab = { ... }`).
3. **Slim `dashboard/dashboard.js`:**
   - Delegate state management to `dashboard_state.js`.
   - Delegate CSV export to `csv_exporter.js` (must pass `test_dashboard_csv_export_rfc4180.js`).
   - Delegate audio equalizer and visualizer to `audio_lab_controller.js` (must pass `test_dashboard_full_audio_lab_parity.js`).
   - Delegate command palette to `omni_palette.js` and scrubber to `scrubber.js`.
   - Delegate chart drawing to `donut_chart.js` and `time_series_chart.js`.
   - Reduce total line count from 6,335 lines to under 400 lines.
4. **Preserve DOM Element Binding Integrity:**
   Ensure `DOMContentLoaded` event listener boots the modular controllers in proper order and attaches event listeners to existing DOM IDs (`#heroAudioEqCard`, `#domainTable`, etc.).
5. **Verify UTF-8 BOM:**
   Ensure `dashboard/dashboard.js` is saved with UTF-8 BOM (`0xEF, 0xBB, 0xBF`).

---

## 🚫 4. Architectural Constraints & Out-of-Scope Boundaries

- **DO NOT** break existing element IDs in `dashboard/dashboard.html`.
- **DO NOT** remove RFC 4180 CSV export validation or quote escaping.
- **DO NOT** use `innerHTML` for table rows or chart legends; use safe DOM element creation.

---

## 🧪 5. Local Verification Gate

Run the following test suites to verify Phase 03 completion:
```bash
node tests/test_dashboard_full_audio_lab_parity.js
node tests/test_dashboard_csv_export_rfc4180.js
node tests/test_dashboard_uiux_phase1.js
node tests/test_dashboard_uiux_phase2.js
node tests/test_dashboard_uiux_phase3.js
node tests/test_dashboard_uiux_phase4.js
node tests/test_dashboard_window_focus_and_hub_retry.js
node tests/test_dashboard_multi_browser_filter.js
node tests/test_dashboard_sleep_settings_sync.js
node tests/test_syntax_and_manifest_integrity.js
```
**Gate Requirement:** All 10 dashboard test suites must pass with 100% exit code 0.
