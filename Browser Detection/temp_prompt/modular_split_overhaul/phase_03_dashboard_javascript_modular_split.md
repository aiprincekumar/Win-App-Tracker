# Phase 03: Dashboard JavaScript Modular Split

> **Document Type:** Dedicated Phase Instruction Set  
> **Workspace Container:** [`temp_prompt/modular_split_overhaul/phase_03_dashboard_javascript_modular_split.md`](phase_03_dashboard_javascript_modular_split.md)  
> **Specialist Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target Department:** Dept 05 (Frontend Engineering) & Dept 02 (Solution Architecture)  
> **Target Agent Role:** Level 4 Frontend Systems Engineer  
> **Active Working Memory:** [`memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md)  
> **Status:** READY FOR EXECUTION (LOCKED UNDER DECISION GATE BARRIER)  

---

## 🎯 1. Phase Objective

Deconstruct the largest monolith in the repository — **`dashboard/dashboard.js`** (**5,638 lines, 253 KB**) — into clean, domain-driven modules under `src/dashboard/`. Maintain a backward-compatible root facade in `dashboard/dashboard.js` that satisfies Node.js AST parsing via `new vm.Script()` and all browser runtime requirements, ensuring zero regressions across all 12 test suites targeting dashboard functionality.

---

## 📋 2. Prerequisites & Inputs

- **Prerequisites:** Phase 01 and Phase 02 completed cleanly; all prior verification tests green.
- **Target Files:**
  - `dashboard/dashboard.js` (5,638 lines) — [dashboard.js](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js#L1-L5638)
  - `src/dashboard/` subdirectories (`state/`, `charts/`, `components/`, `filters/`, `services/`, `audio/`, `palette/`, `scrubber/`)

---

## 🔍 3. Technical Context & File Anchors

In `dashboard/dashboard.js`:
- Lines 1-150: Global state container, DOM caching, and initialization lifecycle.
- Lines 151-600: Filter logic (Multi-browser filtering, domain search, date range pickers).
- Lines 601-1250: Data table rendering (top domains, time formatting, sortable columns).
- Lines 1251-1900: Data visualization (SVG Donut chart, bar chart animations, kinetic roll math).
- Lines 1901-2650: CSV Export engine (`escapeCsvCell`, `exportTimeTrackingCsv`, `exportMediaHistoryCsv`, RFC 4180 escaping, BOM).
- Lines 2651-3650: Audio Lab & DSP UI (`DASHBOARD_EQ_PRESETS`, 5-band frequency sliders, master boost, reset curve, vocal/night switches).
- Lines 3651-4400: Omni Command Palette (`OmniCommandPaletteController`, hotkey bindings, fuzzy search, cyclic navigation).
- Lines 4401-5050: Precision Timeline Scrubber (`PrecisionTimelineScrubber`, tooltip coordinate math, haptic audio ticks, chapter ticks).
- Lines 5051-5638: Mini player dock, sticky bottom bar, toast notifications, and event listener bindings (`setupEventListeners()`).

---

## 🛠️ 4. Surgical Step-by-Step Instructions

1. **Step 1: Modularize State & Filters (`src/dashboard/state/` & `filters/`)**
   - Refactor `src/dashboard/state/dashboard_state.js`: Central state store for active tab, tracking data, media telemetry, and audio settings.
   - Refactor `src/dashboard/filters/browser_filter.js`: Multi-browser filtering logic (Chrome, Edge, Firefox, Brave, Opera) and domain search.

2. **Step 2: Modularize Visualization & Tables (`src/dashboard/charts/` & `components/`)**
   - Refactor `src/dashboard/charts/donut_chart.js`: SVG donut chart rendering with balanced paths.
   - Refactor `src/dashboard/charts/time_series_chart.js`: Daily time tracking bar chart with kinetic roll transitions.
   - Refactor `src/dashboard/components/domain_table.js`: Sortable domain tables with pagination and zero-innerHTML DOM building.

3. **Step 3: Modularize CSV Export Service (`src/dashboard/services/csv_exporter.js`)**
   - Implement `escapeCsvCell(cell)`: RFC 4180 quotes escaping, multiline preservation, and DDE formula injection neutralization.
   - Implement `exportTimeTrackingCsv(data)`: 7-column CSV export starting with UTF-8 BOM (`\uFEFF`).
   - Implement `exportMediaHistoryCsv(data)`: 12-column media metadata CSV export starting with UTF-8 BOM (`\uFEFF`).

4. **Step 4: Modularize Audio Lab Controller (`src/dashboard/audio/audio_lab_controller.js`)**
   - Export `DASHBOARD_EQ_PRESETS`: Canonical 9 EQ curve arrays (`flat`, `bass_boost`, `vocal`, `treble`, etc.).
   - Implement slider adjustment handlers (`#eqBand60` - `#eqBand16000`), reset flat curve button, and decibel badge updates.

5. **Step 5: Modularize Command Palette & Scrubber (`palette/` & `scrubber/`)**
   - Modularize `OmniCommandPaletteController` in `src/dashboard/palette/omni_palette.js`.
   - Modularize `PrecisionTimelineScrubber` in `src/dashboard/scrubber/scrubber.js` with ease-out quart easing curve.

6. **Step 6: Assemble Root Facade in `dashboard/dashboard.js`**
   - Maintain root `dashboard/dashboard.js` as an aggregator exposing all classes and functions.
   - Ensure `vm.Script` compatibility: do NOT use top-level bare `import/export` statements that throw in script mode.
   - Verify all event listeners in `setupEventListeners()` correctly bind `#btnExportTrackingCsv`, `#btnExportMediaCsv`, `#btnResetEq`, and sliders.
   - Preserve UTF-8 BOM (`0xEF, 0xBB, 0xBF`).

---

## 🚫 5. Architectural Constraints & Boundaries

- **vm.Script Constraint:** `new vm.Script(code, { filename: 'dashboard.js' })` MUST parse cleanly without syntax errors.
- **Export Invariant:** `DASHBOARD_EQ_PRESETS`, `OmniCommandPaletteController`, `escapeCsvCell`, and `exportTimeTrackingCsv` must remain directly accessible to tests.
- **W3C Standard:** Zero `innerHTML` assignments in any dashboard component.

---

## 📦 6. Deliverables Manifest

- `src/dashboard/state/dashboard_state.js`
- `src/dashboard/filters/browser_filter.js`
- `src/dashboard/charts/donut_chart.js`
- `src/dashboard/charts/time_series_chart.js`
- `src/dashboard/components/domain_table.js`
- `src/dashboard/services/csv_exporter.js`
- `src/dashboard/audio/audio_lab_controller.js`
- `src/dashboard/palette/omni_palette.js`
- `src/dashboard/scrubber/scrubber.js`
- `dashboard/dashboard.js` (Root Facade Aggregator)

---

## 🧪 7. Local Verification Gate

Execute and pass all tests cleanly with exit code 0:
```powershell
node -c dashboard/dashboard.js
node tests/test_dashboard_csv_export_rfc4180.js
node tests/test_dashboard_full_audio_lab_parity.js
node tests/test_dashboard_uiux_phase1.js
node tests/test_dashboard_uiux_phase2.js
node tests/test_dashboard_uiux_phase3.js
node tests/test_dashboard_uiux_phase4.js
node tests/test_dashboard_multi_browser_filter.js
node tests/test_dashboard_window_focus_and_hub_retry.js
node tests/test_dashboard_sleep_settings_sync.js
node tests/test_dashboard_i18n_bilingual_parity.js
```
