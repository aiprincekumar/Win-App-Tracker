# Phase 01: Universal Data Binding & Hydration Engine

> **Initiative:** Web Activity & Media Sentinel - Report Export System Hardening  
> **Phase Number:** 01 of 04  
> **Document:** `temp_prompt/export_reports_data_and_layout_fix/phase_01_data_binding_and_hydration_engine.md`  
> **Task ID:** `TASK-EXPORT-REPORTS-DATA-LAYOUT-FIX-001`  
> **Primary Subagent Role:** Level 4 Frontend Engineer  
> **Governing Framework:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Target Subsystems:** `dashboard/dashboard.js`, `src/dashboard/features/backup_hub_digest_feature.js`  

---

## 🎯 1. Phase Objective
The objective of Phase 01 is to resolve the fundamental data starvation defects across both "Save PDF" (`triggerPrintPdf`) and "Offline HTML Report" (`downloadStandaloneHtmlDigest` / `generateExecutiveDigestHtml`):
1. In `src/dashboard/features/backup_hub_digest_feature.js`, author a universal `normalizeTelemetryDataset(rawData, options)` engine that seamlessly parses modern `activityData.domains`, legacy day-keyed history snapshots, and pre-computed `items` arrays into a unified domain summary.
2. Fix media playback duration calculation by accumulating canonical `m.watchDuration` (with legacy fallbacks for `m.watchTime` and `m.duration`).
3. In `dashboard/dashboard.js`, rewrite `triggerPrintPdf()` and `downloadStandaloneHtmlDigest()` to extract live computed metrics from dashboard memory (`stats`, active DOM metric cards, `lastCalculatedProductivityScore`, and `mediaHistoryData`), ensuring non-zero, real data is forwarded to the export engines.

---

## 📋 2. Prerequisites & Environment State
- Active workspace: `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`
- Existing files to inspect and modify:
  - [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js)
  - [`src/dashboard/features/backup_hub_digest_feature.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/backup_hub_digest_feature.js)
- Preserved test baseline: `node tests/test_export_dropdown_reports_wiring.js` must remain 100% passing.

---

## 🔍 3. Technical Context & File Anchors

### 3.1 `dashboard/dashboard.js` Anchors
- **Lines 3598–3619:** Current implementation of `triggerPrintPdf(options)`. Reads non-existent `dashboardData.totalSeconds`, `dashboardData.items`, and `dashboardData.totalMediaSeconds`.
- **Lines 3621–3635:** Current implementation of `downloadStandaloneHtmlDigest(data, options)`. Passes `(dashboardData && dashboardData.activityData) || {}` without normalizing `domains`.
- **Lines 6965–6975:** Creation of `stats` object containing `items`, `totalSec`, `todaySec`, `dailyAvgSec`, `activeTemporalSum`, and `topDomain`.
- **Lines 7609, 8719:** Updates to `mediaHistoryData` global array.

### 3.2 `src/dashboard/features/backup_hub_digest_feature.js` Anchors
- **Lines 498–550:** Current implementation of `generateExecutiveDigestHtml(data, options)`. Loops over `Object.keys(trackingHistory)` expecting `day.totalActiveTime` and `day.domains`. Fails completely when passed modern `activityData` where keys are `"domains"`, `"historyDaysCount"`, etc.
- **Lines 523–528:** Media loop reading `(m.watchTime || m.duration || 0)`. The canonical field is `m.watchDuration`.
- **Lines 821–850:** `triggerPrintPdf(options)`. Inserts or finds `#printExecutiveHeader` and sets text on `#printStatTotalTime`, `#printStatTopDomain`, `#printStatProductivity`, `#printStatMediaTime`.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1.1: Author `normalizeTelemetryDataset` in `backup_hub_digest_feature.js`
Inside the module closure of `src/dashboard/features/backup_hub_digest_feature.js`, implement `normalizeTelemetryDataset(rawData, options = {})`:
1. Safely extract tracking object:
   ```javascript
   const dataset = rawData || {};
   const tracking = dataset.tracking_history || dataset.activityData || dataset.trackingHistory || dataset;
   const media = dataset.media_history || dataset.mediaHistory || [];
   ```
2. Handle Schema 1: Direct `items` array (`Array.isArray(tracking.items)` or `Array.isArray(tracking)`).
3. Handle Schema 2: Modern `activityData.domains` dictionary (`tracking.domains && typeof tracking.domains === 'object'`).
   - Iterate over `Object.keys(tracking.domains)`.
   - Read `entry.seconds || entry.totalSeconds || 0`. If 0 and `entry.days` exists, sum seconds across `entry.days`.
   - Aggregate into `domainTotals[dom] = { activeTime, sessions: entry.sessionCount || 1, category: entry.category || 'work' }`.
4. Handle Schema 3: Legacy day-keyed dictionary (`day.totalActiveTime` and `day.domains`).
5. Accumulate `totalMediaSeconds` by iterating over `media` and summing:
   `Number(m.watchDuration || m.watchTime || m.duration || 0)`.
6. Sort domains descending by `activeTime` and return:
   ```javascript
   return {
     totalActiveSeconds,
     totalMediaSeconds,
     sortedDomains,
     topDomain: sortedDomains.length > 0 ? sortedDomains[0].domain : 'None',
     domainCount: sortedDomains.length
   };
   ```

### Step 1.2: Refactor `generateExecutiveDigestHtml` Data Ingestion
In `generateExecutiveDigestHtml(data, options)`:
1. Replace lines 505–536 with a call to `normalizeTelemetryDataset(data, options)`.
2. Ensure `totalActiveSeconds`, `totalMediaSeconds`, `sortedDomains`, and `topDomain` receive real normalized values.
3. If `sortedDomains.length === 0`, ensure graceful fallbacks (`topDomain = 'None'`, SVG donut displays empty ring, table displays empty-state message).

### Step 1.3: Refactor `triggerPrintPdf` in `dashboard/dashboard.js`
In `dashboard/dashboard.js`:
1. Create a helper function `getActiveReportMetrics()`:
   - Extract `totalTime`: If rendered `#trackMetricTotalTime` exists and has text, use it; else if `stats && stats.activeTemporalSum`, format with `formatHHMMSS(stats.activeTemporalSum)`; else if `dashboardData && dashboardData.activityData`, compute via `normalizeTelemetryDataset`; else `'0h 00m'`.
   - Extract `topDomain`: If rendered `#statTopFocusDomain` exists and has text, use it; else if `stats && stats.topDomain`, use `stats.topDomain.domain`; else `'--'`.
   - Extract `productivity`: If `typeof lastCalculatedProductivityScore !== 'undefined'`, use `${lastCalculatedProductivityScore} / 100`; else `'85 / 100'`.
   - Extract `mediaTime`: Sum `(m.watchDuration || m.watchTime || m.duration || 0)` across `mediaHistoryData || []` and format with `formatHHMMSS`.
   - Extract `reportingPeriod`: Use `currentTemporalRange || 'All Recorded Time'`.
2. In `triggerPrintPdf(options)`:
   - Merge `getActiveReportMetrics()` with any caller-provided `options`.
   - Pass the enriched options object to `_BackupHubDigest.triggerPrintPdf(opts)`.

### Step 1.4: Refactor `downloadStandaloneHtmlDigest` in `dashboard/dashboard.js`
In `dashboard/dashboard.js`:
1. When constructing `payload`:
   - Pass modern `dashboardData.activityData || {}`.
   - Pass `mediaHistoryData || []`.
   - Include `currentTemporalRange || 'All Recorded Time'` in `options.reportingPeriod`.
   - Include `lastCalculatedProductivityScore || 85` in `options.productivityIndex`.

---

## 🚫 5. Architectural Constraints & Boundaries
- **Universal Rule 28 Compliance:** Every new or edited function must be $\le 50$ lines with cyclomatic depth $\le 3$.
- **Universal Rule 5 & 8 (UTF-8 with BOM):** Ensure `0xEF, 0xBB, 0xBF` Byte Order Mark is preserved when saving `dashboard.js` and `backup_hub_digest_feature.js`.
- **Zero DOM Deletions:** Do not remove existing buttons (`#btnPrintPdf`, `#btnDownloadHtmlDigest`, `#btnExportMenu`).
- **Zero `innerHTML` Usage:** Update DOM elements via `textContent`.

---

## 📦 6. Deliverables Manifest
- Modified: [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js)
- Modified: [`src/dashboard/features/backup_hub_digest_feature.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/backup_hub_digest_feature.js)

---

## ✅ 7. Local Verification Gate
Execute the following verification command in the project root:
```bash
node -e "
const d = require('./src/dashboard/features/backup_hub_digest_feature.js');
const mockModern = {
  activityData: {
    domains: {
      'github.com': { seconds: 3600, sessionCount: 5, category: 'work' },
      'youtube.com': { seconds: 1800, sessionCount: 2, category: 'entertainment' }
    }
  },
  mediaHistory: [{ watchDuration: 900, title: 'Tutorial' }]
};
const html = d.generateExecutiveDigestHtml(mockModern, { reportingPeriod: 'Today' });
if (!html.includes('github.com')) throw new Error('Missing github.com in generated report');
if (!html.includes('1h 00m') && !html.includes('1h 30m') && !html.includes('15m')) throw new Error('Failed to format duration');
console.log('✅ Phase 01 Data Binding & Normalization Unit Test Passed!');
"
```
And verify existing test suite:
```bash
node tests/test_export_dropdown_reports_wiring.js
```
Both commands must exit with code 0.
