# Chrono-Activity Heatmap (24h x 7d) Complete Overhaul: Master Index & Tracking Board

> **Document Type:** Live Ephemeral Workspace Tracking Board & Problem-Solution Dossier  
> **Workspace Container:** `temp_prompt/chrono_heatmap_overhaul/`  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Command Hierarchy Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target Subsystems:** `dashboard/dashboard.css`, `dashboard/styles/tracking.css`, `dashboard/dashboard.html`, `dashboard/dashboard.js`, `src/dashboard/features/temporal_productivity_feature.js`, `background.js`, `src/background/ws/data_hub_client.js`, `tests/`  
> **Lead Departments:** Dept 05 (Frontend Engineering), Dept 04 (Core Logic / Backend), Dept 06 (Database & Systems Architecture), Dept 08 (QA & Testing)  
> **Target Autonomy Strategy:** Strategy A (Fully Autonomous Phase-wise Execution, Score: 1.0)  

---

## 📋 1. Executive Problem-Solution Dossier

### 1.1 Current Architectural Limitations & Defects
1. **Defect 1: Horizontal Scrollbar & Rigid 24-Column Sizing (UI/UX Flaw):**
   In `dashboard.css` (lines 8216–8222) and `tracking.css`, `.chrono-heatmap-grid` defines `grid-template-columns: 44px repeat(24, minmax(14px, 20px)) !important;` inside `.chrono-heatmap-wrapper { overflow-x: auto; }`. This creates an artificial horizontal scrollbar on standard displays, breaks responsive alignment, and leaves dead whitespace on high-resolution monitors instead of utilizing a fluid 24-column CSS Grid.
2. **Defect 2: Temporal Window Mismatch & Mode Differentiation Deficiency:**
   In `temporal_productivity_feature.js`, `aggregateChronoHeatmap` adapts to global date queries ('today', '30d') which collapses or corrupts the 7x24 matrix (resulting in empty weekday rows). The heatmap requires a strictly enforced rolling 7-day window (Today - 6d to Today) regardless of global filters. Furthermore, mode toggling between "Focus & Browsing Time" and "Media Watch Time" lacks visual differentiation, sharing identical emerald color scales and failing to dynamically adapt tooltips and Week-over-Week metrics to the selected mode.
3. **Defect 3: Legacy Historical Zero-Activity Gap:**
   Pre-existing tracking days recorded prior to intraday telemetry lack discrete hourly buckets. Currently, missing buckets either render completely blank or use naive flat distribution, causing an unrepresentative historical visual experience. An intelligent diurnal backfill algorithm is needed to slot legacy totals proportionally into realistic waking/working hours and leisure media windows based on domain taxonomy.
4. **Defect 4: SQLite Database Hub Schema & WebSocket Sync Parity Gap:**
   WebSocket synchronization to the Standalone Multi-Browser SQLite Data Hub (`ws://127.0.0.1:65433`) transmits flat activity deltas and snapshot history, but lacks explicit schema representation for `hourly_buckets_json` in the database tables. Multi-browser aggregation in SQLite requires hourly bucket serialization so that multi-browser dashboards can query accurate 24-hour heatmaps across Chrome, Edge, and Brave.
5. **Defect 5: Absence of Comprehensive Full-Stack Verification Suite:**
   No automated end-to-end test suite validates all 5 dimensions simultaneously (fluid CSS grid geometry, rolling 7-day aggregation, focus vs media mode dual-palette rendering, intelligent historical backfill math, and SQLite sync serialization).

### 1.2 The Architectural Solution
1. **Phase 1: UI/UX Layout Overhaul (CSS Grid 24-col Full Width, Zero Scrollbar):**
   Overhaul `.chrono-heatmap-grid` to use `grid-template-columns: minmax(36px, 48px) repeat(24, minmax(0, 1fr))` with `width: 100%`, eliminating horizontal scrollbars (`overflow-x: hidden`). Implement fluid cell height (`clamp(14px, 1.8vw, 22px)`), perfectly centered hour labels (00–23), glassmorphic hover zooms, and high-contrast light mode styling.
2. **Phase 2: Temporal Aggregation (Forced 7-Day Rolling Window) & Mode Differentiation:**
   Enforce a strict 7-day rolling window (`Today - 6d` to `Today`) in `aggregateChronoHeatmap`. Implement dual distinct color grading: Emerald/Cyan spectrum for Focus Mode and Violet/Fuchsia spectrum for Media Mode. Dynamically update mode-specific metrics, legend gradients, and contextual tooltip descriptors.
3. **Phase 3: Diurnal Historical Backfill Algorithm:**
   Implement `backfillHistoricalHourlyBuckets(dayData, dateStr)` in `temporal_productivity_feature.js` and `dashboard.js`. For legacy dates lacking hourly buckets, extrapolate hourly activity proportionally: Work/Utility domains mapped to 09:00–18:00 (peaks at 11:00 & 15:00); Entertainment/Media mapped to 12:00–13:00 and 18:00–23:00; Social mapped across waking hours. Conserves 100% of exact daily seconds (`sum === totalSeconds`).
4. **Phase 4: SQLite Database Hub Schema Migration (`hourly_buckets_json`) & WebSocket Sync:**
   Extend `SYNC_ACTIVITY_DELTA` and `SYNC_HISTORY_UPSERT` payloads in `background.js` and `src/background/ws/data_hub_client.js` to serialize `hourly_buckets_json`. Add `SYNC_HOURLY_BUCKETS` message handler for periodic batch sync. Maintain resilient offline queueing and fallback.
5. **Phase 5: Master Test Suites & QA Verification:**
   Build a dedicated 7-battery standalone verification suite `tests/test_chrono_heatmap_overhaul.js` and certify 100% pass rate across all 102+ project test suites via `node run_all_tests.js` with exit code 0.

---

## 🚦 2. Phase Execution Status Checklist

| Phase # | Phase Name | Target File(s) | Primary Subagent Role | Gate Verification Command | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **01** | UI/UX Layout Overhaul (CSS Grid 24-col Full Width, Zero Scrollbar) | `dashboard/dashboard.css`<br>`dashboard/styles/tracking.css`<br>`dashboard/dashboard.html` | Level 4 Frontend Engineer | `node tests/test_chrono_heatmap_overhaul.js --battery=1` | ⏳ READY |
| **02** | Temporal Aggregation (Forced 7d Rolling Window) & Mode Differentiation | `src/dashboard/features/temporal_productivity_feature.js`<br>`dashboard/dashboard.js` | Level 4 Frontend Engineer | `node tests/test_chrono_heatmap_overhaul.js --battery=2` | ⏳ READY |
| **03** | Diurnal Historical Backfill Algorithm (Intelligent Slotting) | `src/dashboard/features/temporal_productivity_feature.js`<br>`dashboard/dashboard.js` | Level 4 Core Logic Engineer | `node tests/test_chrono_heatmap_overhaul.js --battery=3` | ⏳ READY |
| **04** | SQLite Database Hub Schema Migration (`hourly_buckets_json`) & Sync | `background.js`<br>`src/background/ws/data_hub_client.js` | Level 4 Backend Engineer | `node tests/test_chrono_heatmap_overhaul.js --battery=4` | ⏳ READY |
| **05** | Master Test Suites & QA Verification (Zero Regression) | `tests/test_chrono_heatmap_overhaul.js`<br>`run_all_tests.js` | Level 4 QA Verification Tester | `node tests/test_chrono_heatmap_overhaul.js`<br>`node run_all_tests.js` | ⏳ READY |

---

## 📊 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | `dashboard/dashboard.css`<br>`styles/tracking.css` | Fixed column widths `repeat(24, minmax(14px, 20px))` and `overflow-x: auto` force an unwanted horizontal scrollbar. | Refactor grid to `grid-template-columns: minmax(36px, 48px) repeat(24, minmax(0, 1fr))` with `width: 100%` and `overflow-x: hidden`. | Heatmap spans 100% card width seamlessly across all viewports with zero horizontal scrolling. | Phase 1 | Static CSS AST / Layout Inspection |
| **2** | `src/dashboard/features/temporal_productivity_feature.js` | Global temporal range ('today', '30d') passed into `aggregateChronoHeatmap` breaks the 7x24 grid structure. | Enforce strict 7-day rolling window (`today - 6d` to `today`) regardless of external date picker range. | 7 full weekday rows (Mon–Sun) are always rendered with accurate, comparable day metrics. | Phase 2 | `test_chrono_heatmap_overhaul.js` Battery 2 |
| **3** | `src/dashboard/features/temporal_productivity_feature.js`<br>`dashboard/dashboard.css` | Media mode shares identical green palette as Focus mode, obscuring distinction between reading and streaming. | Implement dual color token palettes: Emerald/Cyan for Focus mode (`#10b981`), Violet/Fuchsia for Media mode (`#a855f7`). | Instant visual clarity when toggling between active work and entertainment watch time. | Phase 2 | Visual Theme & Mode Inspection |
| **4** | `src/dashboard/features/temporal_productivity_feature.js` | Legacy dates without hourly telemetry either stay 0 or flatten across uniform blocks, distorting trends. | Implement diurnal backfill algorithm weighting Work (09:00–18:00) vs Media (18:00–23:00) while conserving total seconds. | Seamless, realistic historical visualization with 100% conservation of historical time. | Phase 3 | `test_chrono_heatmap_overhaul.js` Battery 3 |
| **5** | `background.js`<br>`data_hub_client.js` | Data Hub WebSocket payloads omit hourly distribution, causing SQLite multi-browser history to lose hourly fidelity. | Add `hourly_buckets_json` serialization to `SYNC_HISTORY_UPSERT` and delta payloads. | Multi-browser SQLite database stores full 24-hour distribution for every tracked day. | Phase 4 | `test_chrono_heatmap_overhaul.js` Battery 4 |
| **6** | `tests/test_chrono_heatmap_overhaul.js` | Lack of unified automated validation across UI grid, aggregation, backfill, and SQLite sync. | Author dedicated 7-battery standalone test suite and execute full regression runner. | Grade A+ automated test coverage, 100% clean exit code 0 across 102+ test files. | Phase 5 | `node run_all_tests.js` |

---

## 🔒 4. Constitutional Guardrails & Invariants
1. **Universal Rule 28 (Function Modularity):** Every modified and newly introduced function must remain <= 50 lines with a nesting depth <= 3.
2. **W3C Trusted Types Standard:** 100% zero `innerHTML` policy. Use `textContent`, `setAttribute`, and safe DOM node creation.
3. **UTF-8 with BOM Standard:** Strictly preserve UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) on all created and edited files.
4. **Zero-Code Hard Lock:** Subagents execute with authorized `AUTH-MGR-*` token; Level 1 CEO and Level 2 Manager never edit code directly.
5. **Universal Rule 15 (Autonomous Commit):** Autonomously commit locally upon completion with Hindi notification: *"Haan, local me commit ho chuka hai [hash/message]"*.
