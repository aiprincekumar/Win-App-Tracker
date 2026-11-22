# Phase 04: QA Verification Test Suite & Constitutional Compliance

> **Initiative:** Web Activity & Media Sentinel - Report Export System Hardening  
> **Phase Number:** 04 of 04  
> **Document:** `temp_prompt/export_reports_data_and_layout_fix/phase_04_qa_verification_test_suite_and_compliance.md`  
> **Task ID:** `TASK-EXPORT-REPORTS-DATA-LAYOUT-FIX-001`  
> **Primary Subagent Role:** Level 4 QA Verification Tester  
> **Governing Framework:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Target Subsystems:** `tests/test_export_reports_data_and_layout_fix.js`, `run_all_tests.js`  

---

## 🎯 1. Phase Objective
The objective of Phase 04 is to deliver complete, automated, end-to-end QA verification for all deliverables from Phases 01, 02, and 03:
1. Author a dedicated 7-battery standalone test suite `tests/test_export_reports_data_and_layout_fix.js`.
2. Certify multi-schema normalization, canonical media duration calculation, PDF print view DOM hydration, `@media print` CSS overrides, standalone HTML report self-containment, and graceful empty-state handling.
3. Verify Universal Rule 28 modularity ($\le 50$ lines, depth $\le 3$) and Universal Rule 5/8 UTF-8 with BOM across all touched files.
4. Execute the global test runner (`node run_all_tests.js`) to certify zero regressions across the codebase.

---

## 📋 2. Prerequisites & Environment State
- Successful completion of Phase 01, Phase 02, and Phase 03.
- Target files to test and verify:
  - `dashboard/dashboard.js`
  - `src/dashboard/features/backup_hub_digest_feature.js`
  - `dashboard/styles/backup_digest.css`
  - `dashboard/dashboard.css`
  - `dashboard/dashboard.html`
- New file to author:
  - `tests/test_export_reports_data_and_layout_fix.js`

---

## 🧪 3. Detailed Test Battery Specifications

The test suite `tests/test_export_reports_data_and_layout_fix.js` must implement the following 7 test batteries:

### Battery 1: Multi-Schema Data Normalization Verification
- Feed mock modern `activityData.domains` object to `normalizeTelemetryDataset()`. Assert `totalActiveSeconds === 7200`, `topDomain === 'github.com'`, `domainCount === 2`.
- Feed mock legacy day-keyed snapshot `{ "2026-11-21": { totalActiveTime: 3600, domains: { ... } } }`. Assert correct domain totals and active seconds.
- Feed mock pre-computed `items` array. Assert uniform aggregation.
- Assert that all inputs produce identical normalized schema structure.

### Battery 2: Canonical Media Watch Duration Ingestion
- Feed `mediaHistory` array containing items with `watchDuration: 1200`. Assert `totalMediaSeconds === 1200`.
- Feed legacy items with `watchTime: 300` and `duration: 500`. Assert correct fallback accumulation.
- Assert that items with 0 duration do not cause `NaN`.

### Battery 3: PDF Print Header Dynamic Hydration
- Invoke `triggerPrintPdf()` in a mock DOM environment with populated metrics.
- Assert `#printStatTotalTime.textContent` contains real formatted duration (e.g., `"2h 00m"`).
- Assert `#printStatTopDomain.textContent` contains top domain name.
- Assert `#printStatProductivity.textContent` contains productivity index.
- Assert `#printStatMediaTime.textContent` contains formatted media time.
- Assert `#printReportPeriod.textContent` reflects active reporting range.

### Battery 4: Tab-Independent Print Visibility & `@media print` CSS Audit
- Read `dashboard/styles/backup_digest.css` and `dashboard/dashboard.css`.
- Assert `@media print` contains `#paneTracking` with `display: block !important;`.
- Assert `@media print` contains `page-break-inside: avoid !important;` (or `break-inside: avoid !important;`) on cards, tables, and charts.
- Assert `@page { size: A4 portrait; }` is present.
- Assert screen-only interactive elements (`.sidebar`, `.dashboard-header-actions`, etc.) are set to `display: none !important;`.

### Battery 5: Standalone Offline HTML Report Self-Containment & Structure
- Generate HTML string via `generateExecutiveDigestHtml(mockData, options)`.
- Assert valid `<!DOCTYPE html>` doctype.
- Assert presence of quick-print button with class `.btn-print-report` and `onclick="window.print()"`.
- Assert presence of `.no-print` hiding rule in inline CSS.
- Assert presence of `<script id="sentinel-digest-payload" type="application/json">` containing serialized JSON.
- Assert ZERO external URLs (`http://`, `https://`) in script/link tags.
- Assert all domain names and user text are properly HTML-escaped.

### Battery 6: Graceful Empty-State Handling
- Pass empty object `{}` and `{ activityData: { domains: {} }, mediaHistory: [] }` to `generateExecutiveDigestHtml()`.
- Assert report renders without throwing errors.
- Assert output contains `"0m"` or `"0h 00m"` for total time, `"None"` for top domain, and empty-state guidance text.
- Assert zero occurrences of `"NaN"`, `"undefined"`, or `"[object Object]"` in generated HTML.

### Battery 7: Universal Rule 28 & UTF-8 with BOM Compliance
- Verify that every function authored or modified in `dashboard.js` and `backup_hub_digest_feature.js` has line count $\le 50$ and cyclomatic depth $\le 3$.
- Verify that `dashboard.js`, `backup_hub_digest_feature.js`, and `tests/test_export_reports_data_and_layout_fix.js` start with byte sequence `[0xEF, 0xBB, 0xBF]`.

---

## 🛠️ 4. Execution & Regression Verification Commands

1. **Run the New Standalone QA Suite:**
   ```bash
   node tests/test_export_reports_data_and_layout_fix.js
   ```
   *Expected Outcome:* All 7 batteries pass with green checkmarks and exit code 0.

2. **Run the Prior Export Wiring Suite:**
   ```bash
   node tests/test_export_dropdown_reports_wiring.js
   ```
   *Expected Outcome:* All 7 batteries pass with zero regressions.

3. **Run the Global Test Runner:**
   ```bash
   node run_all_tests.js
   ```
   *Expected Outcome:* Complete repository test harness passes with exit code 0.

---

## 📦 5. Deliverables Manifest
- Created: [`tests/test_export_reports_data_and_layout_fix.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_export_reports_data_and_layout_fix.js)
- Verified: [`run_all_tests.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/run_all_tests.js)

---

## 🏁 6. Final Acceptance Gate
The task is certified `COMPLETED` only when:
- All 7 batteries in `test_export_reports_data_and_layout_fix.js` pass with 100% assertions green.
- `run_all_tests.js` executes completely with exit code 0.
- A raw terminal proof is captured and delivered to the Level 2 Manager.
