# Phase 1: Peak Activity Hour Pipeline Fix

> **Phase Spec File:** `temp_prompt/kpi_pipeline_fixes/phase_01_peak_activity_hour_pipeline_fix.md`  
> **Initiative:** Web Activity & Media Sentinel - KPI Telemetry Pipeline Stabilization  
> **Target Subsystem:** Tab A Time Tracking Bento Grid Card 9 (`#trackMetricPeakHour`)  
> **Assigned Department:** Dept 05 Frontend Engineering & Dept 06 Backend API Engineering  
> **Execution Gate:** Level 4 Subagent Dispatch requires `AUTH-MGR-*` token from Level 2 Manager  

---

## 🎯 1. Phase Objective

Fix the end-to-end data pipeline for the **Peak Activity Hour** KPI (Tab A, Card 9) so that it accurately computes and displays the highest 60-minute active browsing window (e.g. `14:00 - 15:00`) from real-time domain `hourlyBuckets` telemetry, with graceful `--:--` fallback when no activity exists.

---

## 📂 2. File Anchors & Prerequisites

- **Primary Target File 1:** [`src/dashboard/features/time_tracking_kpi_feature.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/time_tracking_kpi_feature.js) (lines 120-150: `computePeakActivityHour`)
- **Primary Target File 2:** [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js) (lines 6820-6840: `updateTimeTrackingKpiView`, lines 6950-6960: `renderTimeTrackingTab`)
- **Reference File:** [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js) (lines 2940-2970: `updateHourlyBucket`)

---

## 🛠️ 3. Surgical Implementation Instructions

1. **Refactor `computePeakActivityHour(data, todayStr, stats)` in `src/dashboard/features/time_tracking_kpi_feature.js`:**
   - Universal Rule 28 compliance: Function must remain <= 45 lines, nesting depth <= 3.
   - Initialize 24-slot array `hourlyBins = new Array(24).fill(0)`.
   - Inspect multiple telemetry sources in order:
     a. `data.hourlyBuckets` (direct daily aggregated hourly buckets object `{ [h]: { activeSeconds, activeTime } }`).
     b. `data.activityData && data.activityData.domains` (iterate over domains for `todayStr`, accumulating `dayEntry.hourlyBuckets[h].activeSeconds || dayEntry.hourlyBuckets[h].activeTime`).
     c. `data.domains` (iterate over domains for `todayStr`, accumulating `days[todayStr].hourlyBuckets`).
     d. `stats && stats.hourlyBuckets` (passed from aggregated dashboard data).
     e. Legacy fallback: `data.hourlyBreakdown && data.hourlyBreakdown[todayStr]` or `data.hourlyActivity` array.
   - Iterate through `hourlyBins` (0..23) to find `maxSec` and `peakHour`:
     - If `maxSec === 0` or `peakHour === -1`, return `'--:--'`.
     - Otherwise, format start and end: `const start = String(peakHour).padStart(2, '0') + ':00'; const end = String((peakHour + 1) % 24).padStart(2, '0') + ':00'; return `${start} - ${end}`;`.

2. **Synchronize Dashboard Facade in `dashboard/dashboard.js`:**
   - In `updateTimeTrackingKpiView(data, stats, temporalSubtab, todayStr)`:
     - Ensure `stats` or `data` includes the aggregated `hourlyBuckets` produced by `aggregateDomainsHistoryMap`.
     - Update `#trackMetricPeakHour.textContent = kpi.peakHourStr;`.
   - Ensure UTF-8 with BOM and zero innerHTML compliance.

---

## 🚫 4. Architectural Constraints & Out-of-Scope

- DO NOT mutate the storage schema or change how `background.js` writes `hourlyBuckets`.
- DO NOT inject HTML into `#trackMetricPeakHour`; use `textContent`.
- Maximum function length strictly <= 50 lines (Universal Rule 28).

---

## 🧪 5. Local Verification Gate

- Run targeted node test: `node -e "const kpi = require('./src/dashboard/features/time_tracking_kpi_feature.js'); console.log(kpi.computePeakActivityHour({ hourlyBuckets: { 14: { activeSeconds: 3600 } } }));"`
- Verify output is `'14:00 - 15:00'`.
- Verify empty input returns `'--:--'`.
- Verify UTF-8 with BOM on all touched files.
