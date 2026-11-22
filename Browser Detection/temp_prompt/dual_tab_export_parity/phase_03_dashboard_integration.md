# Phase 3: Dashboard Integration & Telemetry Extraction

> **Task ID:** `TASK-DUAL-TAB-EXPORT-PARITY-001`  
> **Phase:** 03 of 04  
> **Target Subsystem:** Dashboard Event Handlers & Telemetry Extraction  
> **Target File:**  
> - [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js)  
> **Lead Role:** Level 4 Frontend Subagent  
> **Status:** `COMPLETED`  

---

## 🎯 1. Phase Objective
Enhance `dashboard/dashboard.js` to extract live 10-KPI Media metrics and Chrono Heatmap matrix data from the DOM and dashboard runtime state, wiring them into `getActiveReportMetrics()`, `handleExportHtmlDigestClick()`, and `triggerPrintPdf()` so that exported documents are hydrated with active dashboard telemetry.

---

## 📋 2. Prerequisites & Inputs
1. Completion of Phase 1 (CSS print rules) and Phase 2 (HTML digest feature overhaul).
2. Target file: [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js)
3. Architecture specifications: [`TRD.md`](TRD.md) and [`DESIGN.md`](DESIGN.md)

---

## 🔍 3. Technical Context & File Anchors

### 3.1 `dashboard/dashboard.js`
- `getActiveReportMetrics` (lines 3625-3660): Scrapes DOM text for tracking metrics (`trackMetricTodayTime`, `trackMetricDailyAvg`, etc.).
- `triggerPrintPdf` (lines 3661-3680): Calls `_BackupHubDigest.triggerPrintPdf` or `window.print()`.
- `downloadStandaloneHtmlDigest` (lines 3683-3705): Facade delegation to `_BackupHubDigest.downloadStandaloneHtmlDigest`.
- `handleExportHtmlDigestClick` (lines 12624-12660): Assembles `exportPayload` and `exportOptions` when the user clicks "Download Standalone HTML Report".

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1: Expand `getActiveReportMetrics(options)` for Media KPIs
1. Add DOM scraping for the 10 media KPI elements using `readKpiDomText()`:
   ```javascript
   const mediaTotalWatch = readKpiDomText('mediaMetricTotalWatch', '0h 00m');
   const mediaAvgWatch = readKpiDomText('mediaMetricAvgWatch', '0m 00s');
   const mediaSessionsCount = readKpiDomText('mediaMetricSessionsCount', '0');
   const mediaTopPlatform = readKpiDomText('mediaMetricTopPlatform', '--');
   const mediaActiveStreams = readKpiDomText('mediaMetricActiveStreams', '0');
   const mediaAvgVolume = readKpiDomText('mediaMetricAvgVolume', '0%');
   const mediaPeakVolume = readKpiDomText('mediaMetricPeakVolume', '0%');
   const mediaLowVolume = readKpiDomText('mediaMetricLowVolume', '0%');
   const mediaMutedSessions = readKpiDomText('mediaMetricMutedSessions', '0');
   const mediaLongestSession = readKpiDomText('mediaMetricLongestSession', '0h 00m');

   const mediaMetrics = {
     totalWatchTime: mediaTotalWatch,
     avgWatchPerVideo: mediaAvgWatch,
     totalSessions: mediaSessionsCount,
     topPlatform: mediaTopPlatform,
     activeStreams: mediaActiveStreams,
     avgVolume: mediaAvgVolume,
     peakVolume: mediaPeakVolume,
     lowestVolume: mediaLowVolume,
     mutedSessions: mediaMutedSessions,
     longestSession: mediaLongestSession
   };
   ```
2. Extract active Chrono Heatmap matrix data from runtime memory:
   ```javascript
   const chronoHeatmap = (typeof window !== 'undefined' && window.__CHRONO_HEATMAP_DATA__) || null;
   ```
3. Return `mediaMetrics` and `chronoHeatmap` alongside existing tracking properties.

### Step 2: Wire `handleExportHtmlDigestClick`
Update `exportOptions` inside `handleExportHtmlDigestClick`:
```javascript
const activeMetrics = (typeof getActiveReportMetrics === 'function') ? getActiveReportMetrics() : {};
const exportOptions = {
  metrics: activeMetrics,
  mediaMetrics: activeMetrics.mediaMetrics || {},
  chronoHeatmap: activeMetrics.chronoHeatmap || null,
  reportingPeriod: activeMetrics.reportingPeriod || 'All Recorded Time',
  productivityIndex: activeMetrics.productivityScore || 85
};
```

### Step 3: Wire `triggerPrintPdf` Pre-Print Conditioning
Ensure `#paneTracking` and `#paneMedia` are correctly primed in the DOM before opening the print preview:
```javascript
function triggerPrintPdf(options) {
  // If custom header injection or DOM conditioning is needed
  const opts = options || {};
  if (_BackupHubDigest && typeof _BackupHubDigest.triggerPrintPdf === 'function') {
    return _BackupHubDigest.triggerPrintPdf(opts);
  }
  if (typeof window !== 'undefined' && typeof window.print === 'function') {
    window.print();
    return { printed: true };
  }
  return { printed: false, error: 'Print context unavailable' };
}
```

---

## 🚫 5. Architectural Constraints & Out-of-Scope Boundaries
- **DO NOT** remove or break existing tracking metrics in `getActiveReportMetrics`.
- **DO NOT** introduce global variables that pollute `window` without proper guards.
- **Maintain backward compatibility** with callers passing empty objects.

---

## 📦 6. Deliverables Manifest
1. `dashboard/dashboard.js`: Updated `getActiveReportMetrics` and `handleExportHtmlDigestClick` with live 10-KPI media telemetry extraction and Chrono Heatmap dataset forwarding.

---

## 🚦 7. Local Verification Gate
```powershell
# 1. Run export reports data test suite
node tests/test_export_reports_data_and_layout_fix.js

# 2. Run print pagination overhaul test suite
node tests/test_print_pagination_overhaul.js
```
