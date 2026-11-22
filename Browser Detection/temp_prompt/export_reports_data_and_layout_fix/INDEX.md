# Master Index & Problem-Solution Dossier: Export Reports Data Population & Layout Fix

> **Document Type:** Live Ephemeral Workspace Tracking Board & Problem-Solution Dossier  
> **Workspace Container:** `temp_prompt/export_reports_data_and_layout_fix/`  
> **Task ID:** `TASK-EXPORT-REPORTS-DATA-LAYOUT-FIX-001`  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Command Hierarchy Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target Subsystems:** `dashboard/dashboard.js`, `src/dashboard/features/backup_hub_digest_feature.js`, `dashboard/styles/backup_digest.css`, `dashboard/dashboard.css`, `dashboard/dashboard.html`, `tests/`  
> **Lead Departments:** Dept 01 (Product Requirements), Dept 04 (UI/UX Design System), Dept 05 (Frontend Engineering), Dept 08 (QA & Testing)  
> **Target Autonomy Strategy:** Strategy A (Fully Autonomous Phase-wise Execution, Target Autonomy Score: 1.0)  

---

## 📋 1. Executive Problem-Solution Dossier

### 1.1 Context & User Feedback
The user reported a critical defect in both report export capabilities of the Web Activity & Media Sentinel dashboard:
> *"अभी भी ये सिर्फ डेमो और ब्लैंक डेटा शो कर रहा है। पहले तो कुछ भी शो नहीं कर रहा था, पूरा ब्लैंक था। मगर अब KPI वगैरह सब शो कर रहा है लेकिन उसमें डेटा कुछ भी नहीं है। दोनों ही केस में सेम एरर आ रहा है, मतलब एक तरह से ब्लैंक डेटा ही आ रहा है। फॉर्मेट है लेकिन डेटा कुछ नहीं है और फॉर्मेट भी सही नहीं है।"*
> *(Translation: Still it is only showing demo and blank data. Earlier it wasn't showing anything at all, it was completely blank. But now it is showing KPI etc. but there is no data in it. In both cases [Save PDF and Offline HTML Report], the same issue is occurring — essentially blank data is being exported. The format is there, but there is no data, and the format/layout is also not proper.)*

### 1.2 Root Cause Analysis & Forensic Breakdown

#### Defect A: Data Hydration Failure in "Save PDF" (`triggerPrintPdf`)
1. **Unmapped Properties on `dashboardData`:** In `dashboard/dashboard.js`, `triggerPrintPdf()` attempts to read `dashboardData.totalSeconds`, `dashboardData.items`, and `dashboardData.totalMediaSeconds`. However, `dashboardData` received from the background worker via `GET_DASHBOARD_DATA` stores raw `activityData` (`{ domains: { ... } }`) and `mediaHistory` (`[ { watchDuration: ... } ]`). `totalSeconds`, `items`, and `totalMediaSeconds` are `undefined` on `dashboardData`, causing `triggerPrintPdf()` to fall back to `0h 00m`, `--`, and `0h 00m`.
2. **Missing Active Filter & Temporal Range Sync:** The reporting period `#printReportPeriod` is hardcoded to "Reporting Period: All Time" and never synchronized with the active dashboard filter (`temporalSubtab` / `currentTemporalRange`).
3. **Tab Display Lockout in Print Mode:** If the user triggers PDF export while in the Settings tab (where the backup & export action cards reside) or if `#paneTracking` is inactive, `@media print` rules set `#paneSettings` to `display: none !important;` without forcing `#paneTracking` to `display: block !important;`. As a result, the print preview displays only the 4-card header with empty zeros and completely blank pages below it.

#### Defect B: Data Extraction Failure in "Offline HTML Report" (`downloadStandaloneHtmlDigest` / `generateExecutiveDigestHtml`)
1. **Schema Mismatch in `backup_hub_digest_feature.js`:** `generateExecutiveDigestHtml()` expects `trackingHistory` to be structured as a legacy day-keyed map: `{ [dateStr]: { totalActiveTime: number, domains: { ... } } }`. However, the live telemetry payload emitted by `background.js` and `chrome.storage.local` is modern `activityData`:
   ```javascript
   {
     domains: {
       "domain.com": {
         seconds: 1234,
         sessionCount: 5,
         category: "work",
         days: { "2026-11-21": { seconds: 1234, sessions: 5 } }
       }
     },
     historyDaysCount: 1,
     firstTrackedDate: "2026-11-21"
   }
   ```
   When `Object.keys(trackingHistory)` iterates over keys like `"domains"` and `"historyDaysCount"`, `day.totalActiveTime` and `day.domains` evaluate to `undefined`. Consequently, `domainTotals` remains `{}` (empty), `totalActiveSeconds` stays `0`, `sortedDomains` becomes `[]`, the SVG donut segments evaluate to `""`, and the domain table body renders 0 rows.
2. **Media Watch Time Property Key Mismatch:** In `generateExecutiveDigestHtml()`, media duration was accumulated using `(m.watchTime || m.duration || 0)`. The actual property populated by `background.js` and recorded in `mediaHistory` is `m.watchDuration`. As a result, `totalMediaSeconds` evaluated to `0` even when rich media sessions existed.
3. **Substandard Layout & Missing Offline Polish:** The generated HTML report lacks modern visual presentation, responsive bento typography, clear category badging, high-contrast print styles, and graceful empty-state handling for new installations.

---

## 🚦 2. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | `dashboard/dashboard.js` | `triggerPrintPdf` reads non-existent `dashboardData.totalSeconds` & `dashboardData.items`, producing blank `0h 00m` & `--` | Read computed metrics from `stats` / active DOM cards (`trackMetricTotalTime`, `statTopFocusDomain`, `lastCalculatedProductivityScore`, and `mediaHistoryData`) | Full real-time data population in PDF Print executive header | Phase 1 | `node tests/test_export_reports_data_and_layout_fix.js` |
| **2** | `src/dashboard/features/backup_hub_digest_feature.js` | `generateExecutiveDigestHtml` assumes legacy day-keyed schema, causing empty `{}` on modern `activityData.domains` | Implement multi-schema normalizer supporting `activityData.domains`, day-keyed snapshots, and pre-computed `items` | Standalone HTML report correctly displays total time, top domain, donut chart, and domain table | Phase 1 | `node tests/test_export_reports_data_and_layout_fix.js` |
| **3** | `src/dashboard/features/backup_hub_digest_feature.js` | `totalMediaSeconds` checks `m.watchTime \|\| m.duration` instead of canonical `m.watchDuration` | Sum `(m.watchDuration \|\| m.watchTime \|\| m.duration \|\| 0)` | Media Consumed KPI accurately reflects watched minutes/hours | Phase 1 | `node tests/test_export_reports_data_and_layout_fix.js` |
| **4** | `dashboard/styles/backup_digest.css` & `dashboard.css` | Print CSS hides inactive tabs; if print triggered from Settings, tracking tab remains hidden | Add `@media print { #paneTracking { display: block !important; } }` and sanitize paper styling | PDF print preview prints full executive digest regardless of active tab | Phase 2 | `node tests/test_export_reports_data_and_layout_fix.js` |
| **5** | `dashboard/styles/backup_digest.css` & `dashboard.css` | Glassmorphism, gradients, and dark theme colors cause low contrast or unformatted output on paper | Provide clean white-paper `@media print` rules, crisp borders (`#cbd5e1`), high-contrast slate text, and page break isolation | Clean, readable, executive multi-page PDF output | Phase 2 | `node tests/test_export_reports_data_and_layout_fix.js` |
| **6** | `src/dashboard/features/backup_hub_digest_feature.js` | Standalone HTML template lacks executive styling, responsive cards, category badges, and quick-print action | Overhaul standalone HTML template with modern bento KPI cards, SVG donut chart, distribution bars, and quick print button | Ultra-premium, self-contained, 100% offline HTML report | Phase 3 | `node tests/test_export_reports_data_and_layout_fix.js` |
| **7** | `tests/test_export_reports_data_and_layout_fix.js` | Lack of automated tests verifying multi-schema data hydration and report generation | Author 7-battery comprehensive automated test suite verifying data hydration, print DOM, and HTML report integrity | Guaranteed zero regressions, Grade A+ verification signoff | Phase 4 | `node tests/test_export_reports_data_and_layout_fix.js` |

---

## 📅 3. Phase Execution Status Checklist

| Phase # | Phase Name | Primary Target File(s) | Lead Subagent Role | Local Verification Command | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **Phase 01** | Universal Data Binding & Hydration Engine | `dashboard/dashboard.js`<br>`src/dashboard/features/backup_hub_digest_feature.js` | Level 4 Frontend Engineer | `node tests/test_export_reports_data_and_layout_fix.js` | ⏳ PENDING |
| **Phase 02** | PDF Print View Layout & Styling Overhaul | `dashboard/styles/backup_digest.css`<br>`dashboard/dashboard.css`<br>`dashboard/dashboard.html` | Level 4 Frontend Engineer | `node tests/test_export_reports_data_and_layout_fix.js` | ⏳ PENDING |
| **Phase 03** | Standalone Offline HTML Report Template Overhaul | `src/dashboard/features/backup_hub_digest_feature.js` | Level 4 Frontend Engineer | `node tests/test_export_reports_data_and_layout_fix.js` | ⏳ PENDING |
| **Phase 04** | QA Verification Test Suite & Constitutional Compliance | `tests/test_export_reports_data_and_layout_fix.js`<br>`run_all_tests.js` | Level 4 QA Verification Tester | `node tests/test_export_reports_data_and_layout_fix.js`<br>`node run_all_tests.js` | ⏳ PENDING |

---

## 🔒 4. Governance & Constitutional Invariants
- **Main Agent (CEO) & Level 2 Manager Zero-Code Hard Lock:** Neither CEO nor Manager may modify codebase files directly. Execution is strictly delegated to Level 4 Execution Subagents.
- **Universal Rule 28 (Code Modularity):** All new or edited functions must strictly remain under 50 lines with nesting depth $\le 3$.
- **Universal Rule 5 & 8 (UTF-8 with BOM):** All modified or created files must strictly maintain UTF-8 with BOM encoding (`0xEF, 0xBB, 0xBF`).
- **W3C Trusted Types Safe:** 100% zero unescaped `innerHTML` or `outerHTML` assignments. All DOM manipulations must use `textContent`, `setAttribute`, or safe template literals with sanitization.
- **Offline Self-Containment:** Standalone HTML reports must operate 100% offline with zero external CDN dependencies (no unpkg, cdnjs, or Google Fonts URLs).
