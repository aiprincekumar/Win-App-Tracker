# Phase 2: Implementation of Date Filter Logic, Metric Aggregation & Bilingual UI Sync

> **Workspace Container:** `temp_prompt/time_tracking_date_filter_fixes/`  
> **Document:** `phase_02_filter_logic_and_i18n_implementation.md`  
> **Target Subsystems:** Temporal Aggregator, Donut Center Label, Bilingual i18n  
> **Target Files:** `dashboard/dashboard.js`, `dashboard/dashboard.html`  
> **Assigned Role:** Level 4 Frontend Engineer  

---

## 🎯 1. Phase Objective
1. Correct domain metric accumulation in `processTimeTrackingData` so `foregroundSeconds`, `backgroundMediaSeconds`, and `combinedSeconds` reflect the active date range instead of defaulting to all-time totals.
2. Fix `renderTimeTrackingTab` SQLite Data Hub branch to gracefully support all temporal subtabs (`yesterday`, `7d`, `30d`, `custom`) without silently falling back to all-time totals.
3. Update `renderDonutChart` to display accurate, localized center labels for all temporal modes.
4. Expand `DASHBOARD_I18N` with full bilingual English and Hindi translations for all temporal labels and captions.
5. Update `#captionUsageDist` in `dashboard/dashboard.html` and its corresponding i18n key.

---

## 📋 2. Prerequisites & Inputs
- Successful completion of Phase 1 date arithmetic standardization.
- Access to [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js)
- Access to [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html)

---

## 🔍 3. File Anchors & Technical Context
- **Anchor 1:** `dashboard/dashboard.js#L6349-L6351` — In `processTimeTrackingData`, fallback assignments for `foregroundSeconds`, `backgroundMediaSeconds`, and `combinedSeconds`.
- **Anchor 2:** `dashboard/dashboard.js#L6506-L6515` — In `renderTimeTrackingTab`, handling of `temporalSubtab` when `dataHubConnected` is true.
- **Anchor 3:** `dashboard/dashboard.js#L6606-L6612` — In `renderDonutChart`, subtab-to-label mapping.
- **Anchor 4:** `dashboard/dashboard.js#L221-L225` & `#L784-L788` — `DASHBOARD_I18N` English & Hindi subtab dictionaries.
- **Anchor 5:** `dashboard/dashboard.html#L442` — `#captionUsageDist` text.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

1. **Range-Specific Accumulation in `processTimeTrackingData`:**
   - In `processTimeTrackingData`, during the iteration over `datesList` for range modes (`yesterday`, `7d`, `30d`, `custom`), compute:
     - `rangeFgSec`: sum of foreground seconds across dates in range.
     - `rangeBgSec`: sum of background media seconds across dates in range.
     - `rangeCombinedSec`: sum of combined seconds across dates in range.
   - For `processedList.push`, set:
     - `foregroundSeconds`: `(temporalMode === 'today' ? fgTodaySec : (temporalMode === 'total' || temporalMode === 'daily') ? fgTotalSec : rangeFgSec)`
     - `backgroundMediaSeconds`: `(temporalMode === 'today' ? bgMediaTodaySec : (temporalMode === 'total' || temporalMode === 'daily') ? bgMediaTotalSec : rangeBgSec)`
     - `combinedSeconds`: `(temporalMode === 'today' ? combinedTodaySec : (temporalMode === 'total' || temporalMode === 'daily') ? combinedTotalSec : rangeCombinedSec)`

2. **Parity in `renderTimeTrackingTab`:**
   - When `dataHubConnected` is true, check if `dataHubAnalytics` provides range breakdown data for the requested `temporalSubtab`. If not available, gracefully utilize `processTimeTrackingData(data.activityData, temporalSubtab, todayStr)` to compute range items so the user receives accurate historical date filtering.

3. **Donut Chart Subtab Center Label:**
   - In `renderDonutChart(items, totalSeconds, subtab)`, map `subtab` to corresponding i18n keys:
     - `'today'` -> `donut_center_today`
     - `'yesterday'` -> `donut_center_yesterday`
     - `'7d'` -> `donut_center_7days`
     - `'30d'` -> `donut_center_30days`
     - `'custom'` -> `donut_center_custom`
     - `'daily'` -> `donut_center_daily`
     - `'total'` -> `donut_center_total`
   - Safely update `centerLabelEl.textContent = t(key)`.

4. **Expand `DASHBOARD_I18N`:**
   - In English dictionary:
     ```javascript
     donut_center_yesterday: "Yesterday's Total",
     donut_center_7days: "Last 7 Days Total",
     donut_center_30days: "Last 30 Days Total",
     donut_center_custom: "Custom Range Total",
     caption_usage_dist: "Select time range: Today, Yesterday, Last 7 Days, Last 30 Days, Daily Average, or Total Time",
     ```
   - In Hindi dictionary:
     ```javascript
     donut_center_yesterday: "कल का कुल समय",
     donut_center_7days: "पिछले 7 दिनों का कुल समय",
     donut_center_30days: "पिछले 30 दिनों का कुल समय",
     donut_center_custom: "कस्टम अवधि का कुल समय",
     caption_usage_dist: "समय सीमा चुनें: आज, कल, पिछले 7 दिन, पिछले 30 दिन, दैनिक औसत, या कुल समय",
     ```

5. **HTML Caption Synchronization:**
   - In `dashboard/dashboard.html` line 442, update the default English caption for `#captionUsageDist` to:
     `Select time range: Today, Yesterday, Last 7 Days, Last 30 Days, Daily Average, or Total Time`

6. **Preserve Function Modularity & Encoding:**
   - Adhere strictly to Universal Rule 28 (<= 50 lines per function, nesting <= 3).
   - Retain UTF-8 with BOM on `dashboard/dashboard.js` and `dashboard/dashboard.html`.

---

## 🚫 5. Architectural Constraints & Boundaries
- DO NOT use `innerHTML`. Use `textContent` for text updates.
- DO NOT break existing working subtabs (`today`, `daily`, `total`).
- Ensure `temporalSubtab` state transitions remain responsive and smooth.

---

## 📦 6. Deliverables Manifest
- Updated `dashboard/dashboard.js` with range-filtered metric accumulation, donut center label mapping, and expanded i18n keys.
- Updated `dashboard/dashboard.html` with synchronized caption.

---

## 🧪 7. Local Verification Gate
Execute syntax and import check:
```powershell
node -e "const fs = require('fs'); const c = fs.readFileSync('dashboard/dashboard.js', 'utf8'); console.log('Syntax OK, Length:', c.length);"
```
The command must exit with code 0.
