# Time Tracking Date Filter Logic Fixes: Master Index & Tracking Board

> **Document Type:** Live Ephemeral Workspace Tracking Board & Problem-Solution Dossier  
> **Workspace Container:** `temp_prompt/time_tracking_date_filter_fixes/`  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Command Hierarchy Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target Subsystems:** `dashboard/dashboard.html`, `dashboard/dashboard.js`, `src/dashboard/features/temporal_productivity_feature.js`, `src/dashboard/features/time_tracking_kpi_feature.js`, `tests/`  
> **Lead Departments:** Dept 04 (Core Logic / Backend), Dept 05 (Frontend Engineering), Dept 08 (QA & Testing)  
> **Target Autonomy Strategy:** Strategy A (Fully Autonomous Phase-wise Execution, Score: 1.0)  

---

## 📋 1. Executive Problem-Solution Dossier

### 1.1 Current Limitations & Defects
1. **Unanchored Date Arithmetic:** In `dashboard/dashboard.js` (`processTimeTrackingData`), temporal modes (`yesterday`, `7d`, `30d`) instantiate arbitrary local timestamps via `new Date()` instead of computing relative offsets from the provided `todayStr` reference date. This induces temporal skew and failure in non-local timezones or historical replays.
2. **Missing Range-Filtered Secondary Metrics:** While `computedSec` sums domain activity over the date range, `foregroundSeconds`, `backgroundMediaSeconds`, and `combinedSeconds` in `processedList` incorrectly fall back to all-time totals (`fgTotalSec`, `bgMediaTotalSec`, `combinedTotalSec`) for non-today filters. As a result, category breakdowns and secondary telemetry display inflated all-time numbers instead of range-specific metrics.
3. **SQLite Data Hub Silent Fallback:** In `renderTimeTrackingTab`, when `dataHubConnected` is active, any `temporalSubtab` other than `'today'` and `'daily'` falls through to `'total'`, completely ignoring `'yesterday'`, `'7d'`, `'30d'`, and `'custom'` requests.
4. **Donut Chart Subtab Label Disconnect:** In `renderDonutChart`, subtabs other than `'today'` and `'daily'` default to displaying `t('donut_center_total')` ("Total Time"). The bilingual dictionary (`DASHBOARD_I18N`) lacks keys for `donut_center_yesterday`, `donut_center_7days`, `donut_center_30days`, and `donut_center_custom`.
5. **Card Caption Stale Wording:** `#captionUsageDist` in `dashboard/dashboard.html` only references "Today, Daily Average, or Total Time", omitting Yesterday, Last 7 Days, and Last 30 Days.

### 1.2 The Architectural Solution
1. **Deterministic Relative Date Range Resolver:** Standardize relative date generation based strictly on the anchor `todayStr` parameter (e.g. splitting `YYYY-MM-DD` and computing exact day offsets), with built-in standalone fallback in the event `_TemporalProductivity.getDatesInRange` is unavailable.
2. **True Temporal Slice Aggregation:** In `processTimeTrackingData`, calculate filtered foreground, background media, and combined seconds per domain across all dates within the requested temporal slice (`yesterday`, `7d`, `30d`, `custom`).
3. **Data Hub & Storage Parity:** Ensure `renderTimeTrackingTab` seamlessly leverages range-filtered stats from `processTimeTrackingData` across all temporal subtabs.
4. **Donut Center & UI Bilingual Parity:** Introduce `donut_center_yesterday`, `donut_center_7days`, `donut_center_30days`, and `donut_center_custom` in both English and Hindi dictionaries; dynamically display the appropriate center label based on the active temporal subtab.
5. **Universal Rule 28 Compliance:** Ensure all refactored logic remains within modular constraints (<= 50 lines per function, nesting <= 3, zero innerHTML).

---

## 🚦 2. Phase Execution Status Checklist

| Phase # | Phase Name | Target File(s) | Primary Subagent Role | Gate Verification Command | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **01** | Date Arithmetic & Relative Anchor Standardization | `dashboard/dashboard.js`<br>`src/dashboard/features/temporal_productivity_feature.js` | Level 4 Core Logic Engineer | `node -e "require('./src/dashboard/features/temporal_productivity_feature.js'); console.log('OK')"` | ⏳ READY |
| **02** | Temporal Slice Aggregation & Bilingual UI Sync | `dashboard/dashboard.js`<br>`dashboard/dashboard.html`<br>`src/dashboard/features/time_tracking_kpi_feature.js` | Level 4 Frontend Engineer | `node -e "require('./dashboard/dashboard.js'); console.log('OK')"` | ⏳ READY |
| **03** | QA Verification & Automated Test Suite Authoring | `tests/test_time_tracking_date_filter_logic.js`<br>`run_all_tests.js` | Level 4 QA Verification Tester | `node tests/test_time_tracking_date_filter_logic.js`<br>`node run_all_tests.js` | ⏳ READY |

---

## 📊 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | `dashboard/dashboard.js` | `processTimeTrackingData` instantiates `new Date()` without anchoring to `todayStr`. | Parse `todayStr` (YYYY-MM-DD) into year, month, date parts and derive yesterday, 7d, 30d start dates deterministically. | 100% deterministic date filtering across all timezones and mock dates. | Phase 1 | Node execution test |
| **2** | `dashboard/dashboard.js` | Non-today modes fall back to all-time foreground and background media totals in `processedList`. | Accumulate date-specific `foregroundSeconds`, `backgroundMediaSeconds`, and `combinedSeconds` during the range loop. | Accurate category distribution and mode filtering (Foreground vs Background Media) on historical ranges. | Phase 2 | Unit test assertion |
| **3** | `dashboard/dashboard.js` | `renderTimeTrackingTab` SQLite data hub branch defaults unknown subtabs to all-time `totalSec`. | Route non-today/daily subtabs through `processTimeTrackingData` or range-aggregated domain list. | Consistent temporal filtering regardless of whether data hub is connected or disconnected. | Phase 2 | Regression test |
| **4** | `dashboard/dashboard.js` | Donut chart center label defaults to `donut_center_total` for yesterday, 7d, 30d, custom. | Add switch/mapping for all subtabs and add missing English & Hindi keys to `DASHBOARD_I18N`. | Perfect visual feedback and bilingual completeness. | Phase 2 | i18n parity check |
| **5** | `dashboard/dashboard.html` | Card caption `#captionUsageDist` omits full range list. | Update caption text and i18n dictionary key `caption_usage_dist` to mention all temporal modes. | Polished UI alignment. | Phase 2 | HTML inspection |
| **6** | `tests/test_time_tracking_date_filter_logic.js` | Lack of automated tests verifying temporal subtabs (`today`, `yesterday`, `7d`, `30d`, `custom`). | Author comprehensive test suite covering all 5 temporal ranges, date arithmetic, and bilingual labels. | Full test coverage preventing future regression. | Phase 3 | `node tests/test_time_tracking_date_filter_logic.js` |

---

## 🔒 4. Constitutional Guardrails & Invariants
1. **UTF-8 with BOM Standard:** All modified files must retain UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
2. **Universal Rule 28 Compliance:** Max function length <= 50 lines, max cyclomatic nesting <= 3.
3. **Zero innerHTML Safe:** All DOM updates must strictly use `textContent`, `setAttribute`, or safe DOM element generation.
4. **Bilingual Parity:** 100% parity across English and Hindi strings in `DASHBOARD_I18N`.
