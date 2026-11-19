# Phase 3: Diurnal Historical Backfill Algorithm (Intelligent Slotting)

> **Document Type:** Standalone Executable Phase Prompt  
> **Workspace Container:** `temp_prompt/chrono_heatmap_overhaul/`  
> **Phase Identifier:** `PHASE-03-HISTORICAL-BACKFILL-ALGO`  
> **Target Subsystems:** `src/dashboard/features/temporal_productivity_feature.js`, `dashboard/dashboard.js`  
> **Responsible Subagent:** Level 4 Core Logic Engineer Subagent  
> **Allocated Department:** Dept 04 (Core Logic / Backend)  
> **Allocated Skills:** `backend-patterns`, `code-simplification`  
> **Required Authorization:** `AUTH-MGR-*` token issued by Level 2 Manager  

---

## 🎯 1. Phase Objective

Design and implement a mathematically sound, diurnal historical backfill algorithm: `backfillHistoricalHourlyBuckets(dayData, dateStr)`. When rendering or aggregating historical dates that lack real-time hourly bucket telemetry (dates tracked prior to the hourly bucket upgrade), this algorithm slots the day's recorded active and media time into realistic hourly distributions based on domain taxonomy and circadian usage curves. Crucially, it mathematically guarantees 100% conservation of total recorded active and media seconds with zero drift.

---

## 🛠️ 2. File Anchors & Technical Context

- `src/dashboard/features/temporal_productivity_feature.js`: Lines 290–330 (`applyDomainFallbackToMatrix`), lines 450–480 (hourly aggregation loop in `aggregateChronoHeatmap`).
- `dashboard/dashboard.js`: Lines 2960–3000 (`aggregateDomainsHistoryMap`).

---

## 📋 3. Step-by-Step Surgical Implementation Instructions

### Step 3.1: Define Diurnal Circadian Weight Vectors
In `src/dashboard/features/temporal_productivity_feature.js`, define normalized 24-hour weight vectors representing typical user activity:
1. **Productivity / Work Vector (`WORK_HOURLY_WEIGHTS`):**
   - Waking hours: 08:00 to 19:00.
   - Core peaks: 10:00–12:00 (weight 0.14) and 14:00–17:00 (weight 0.12).
   - Inactive: 00:00 to 07:00 (weight 0.0).
2. **Entertainment / Media Vector (`MEDIA_HOURLY_WEIGHTS`):**
   - Leisure hours: 12:00–13:00 (lunch break, weight 0.10) and 18:00–23:00 (evening leisure, weights 0.12–0.16).
3. **Utility / General Vector (`GENERAL_HOURLY_WEIGHTS`):**
   - Distributed waking hours: 08:00 to 22:00.

### Step 3.2: Implement `backfillHistoricalHourlyBuckets` Function
Create a modular function (<= 45 lines per Universal Rule 28):
```javascript
function backfillHistoricalHourlyBuckets(dayData, dateStr) {
  if (!dayData || !dayData.domains) return {};
  if (hasValidHourlyTelemetry(dayData)) return dayData.hourlyBuckets;

  const buckets = {};
  for (let h = 0; h < 24; h++) {
    buckets[h] = { activeSeconds: 0, mediaSeconds: 0, sessions: 0, topDomain: '' };
  }

  let totalActive = 0;
  let totalMedia = 0;
  let dominantDomain = '';
  let maxDomainSec = 0;

  for (const [dom, dObj] of Object.entries(dayData.domains)) {
    const act = (dObj && (dObj.activeTime || dObj.seconds || dObj.foregroundSeconds || dObj.totalSeconds)) || 0;
    const med = (dObj && (dObj.mediaTime || dObj.backgroundMediaSeconds)) || 0;
    totalActive += act;
    totalMedia += med;
    if (act + med > maxDomainSec) {
      maxDomainSec = act + med;
      dominantDomain = dom;
    }
  }

  distributeSecondsAcrossBuckets(buckets, totalActive, totalMedia, dominantDomain);
  return buckets;
}
```

### Step 3.3: Implement `distributeSecondsAcrossBuckets` with Zero-Drift Conservation
Create the distribution helper (<= 35 lines):
1. Compute the hour-by-hour allocated seconds using integer math (`Math.floor(totalActive * WORK_HOURLY_WEIGHTS[h])`).
2. Tally the allocated sum: `allocatedSum`.
3. Calculate the remainder: `remainder = totalActive - allocatedSum`.
4. Add the remainder to the peak activity hour (e.g. Hour 11) to ensure:
   $$\sum_{h=0}^{23} \text{buckets}[h].\text{activeSeconds} === \text{totalActive}$$
5. Perform the exact same mathematical conservation for `mediaSeconds` using `MEDIA_HOURLY_WEIGHTS` and add remainder to Hour 20.
6. Populate `topDomain` in populated buckets with `dominantDomain`.

### Step 3.4: Integrate with `aggregateChronoHeatmap`
In `aggregateChronoHeatmap`:
1. When iterating through `targetDates`, check `hasValidHourlyTelemetry(dayData)`.
2. If false, invoke `backfillHistoricalHourlyBuckets(dayData, dateStr)`.
3. Feed the resulting populated buckets into the 7x24 matrix, seamlessly rendering rich, authentic-looking circadian heatmaps without blanks.

---

## 🚫 4. Architectural Constraints & Boundaries

- **Strict Conservation Law:** Under no circumstance may `totalActive` or `totalMedia` deviate from the stored daily sums. Not a single second may be invented or deleted.
- **Rule 28 Compliance:** Functions must remain <= 50 lines with nesting depth <= 3.
- **Non-destructive In-Memory Processing:** Default operation runs in-memory during aggregation so original raw storage remains pristine unless an explicit migration flag is passed.
- **UTF-8 with BOM Standard:** Preserve BOM on all modified files.

---

## 🧪 5. Local Verification Gate

Execute backfill conservation test:
```powershell
node -e "const f = require('./src/dashboard/features/temporal_productivity_feature.js'); const mock = { domains: { 'github.com': { seconds: 7200 } } }; const b = f.backfillHistoricalHourlyBuckets(mock, '2026-11-01'); let sum = 0; Object.values(b).forEach(x => sum += x.activeSeconds); console.log('Exact Sum 7200:', sum === 7200);"
```
Ensure exit code 0.
