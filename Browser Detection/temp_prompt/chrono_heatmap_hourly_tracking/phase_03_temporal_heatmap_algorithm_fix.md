# Phase 03: Temporal Feature Heatmap Engine Dual-Mode & Fallback

> **Document Type:** Standalone Phase Execution Prompt  
> **Phase #:** 03  
> **Target Subsystem:** Temporal Feature Core (`src/dashboard/features/temporal_productivity_feature.js`)  
> **Assigned Subagent Role:** Level 4 Frontend Engineer  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Mandatory Anchor:** First load and adhere to `dynamic_departments_matrix.md` and `memory.md` before executing instructions.  

---

## 🎯 1. Phase Objective
Fix `aggregateChronoHeatmap` in `src/dashboard/features/temporal_productivity_feature.js` so that:
1. It checks whether `hourlyBuckets` contains populated keys with non-zero duration (> 0) before using the hourly telemetry branch.
2. If `hourlyBuckets` is empty or all zeroes, it seamlessly falls back to domain-based estimation (`dayData.domains`).
3. Uniformly extracts `activeSeconds` / `activeTime` and `mediaSeconds` / `backgroundMediaSeconds`.
4. Accurately updates `matrix[dayOfWeek][h].topDomain`.

---

## 📋 2. Prerequisites & Dependencies
- Phase 01 and Phase 02 understanding.
- Adherence to Universal Rule 28 (<= 50 lines per function, clean modularity).
- UTF-8 with BOM preservation on `src/dashboard/features/temporal_productivity_feature.js`.

---

## 🔍 3. Technical Context & File Anchors
- Target File: [`src/dashboard/features/temporal_productivity_feature.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/temporal_productivity_feature.js)
  - `aggregateChronoHeatmap(rawHistory, range)` around line 279 to 448.
  - Hourly loop and domain fallback branch around line 398 to 447.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1: Fix Branch Condition in `aggregateChronoHeatmap`
Replace lines 398–446 with the dual-mode evaluator:

```javascript
        let hasHourlyTelemetry = false;
        if (dayData.hourlyBuckets && typeof dayData.hourlyBuckets === 'object') {
          const keys = Object.keys(dayData.hourlyBuckets);
          if (keys.length > 0) {
            hasHourlyTelemetry = keys.some(k => {
              const b = dayData.hourlyBuckets[k];
              return b && ((b.activeTime || b.activeSeconds || 0) > 0 || (b.mediaTime || b.mediaSeconds || b.backgroundMediaSeconds || 0) > 0);
            });
          }
        }

        if (hasHourlyTelemetry) {
          for (let h = 0; h < 24; h++) {
            const bucket = dayData.hourlyBuckets[h];
            if (bucket) {
              const act = bucket.activeTime || bucket.activeSeconds || 0;
              const med = bucket.mediaTime || bucket.mediaSeconds || bucket.backgroundMediaSeconds || 0;
              const sess = bucket.sessions || bucket.sessionCount || 0;

              matrix[dayOfWeek][h].activeSeconds += act;
              matrix[dayOfWeek][h].mediaSeconds += med;
              matrix[dayOfWeek][h].sessionCount += sess;
              totalActiveTime += act;
              totalMediaTime += med;

              if (bucket.topDomain) {
                matrix[dayOfWeek][h].topDomain = bucket.topDomain;
              }
            }
          }
        } else if (dayData.domains) {
          // Fallback if daily telemetry exists without hourly breakdown
          let dayActive = 0;
          let dayMedia = 0;
          let dayTopDomain = '';
          let maxSec = 0;
          for (const [dom, dObj] of Object.entries(dayData.domains)) {
            const s = (dObj && (dObj.activeTime || dObj.seconds || dObj.foregroundSeconds || dObj.totalSeconds)) || 0;
            const m = (dObj && (dObj.mediaTime || dObj.backgroundMediaSeconds)) || 0;
            dayActive += s;
            dayMedia += m;
            if (s > maxSec) {
              maxSec = s;
              dayTopDomain = dom;
            }
          }
          totalActiveTime += dayActive;
          totalMediaTime += dayMedia;
          if (dayActive > 0 || dayMedia > 0) {
            const perHour = Math.round(dayActive / 8);
            const perHourMedia = Math.round(dayMedia / 8);
            for (let h = 10; h < 18; h++) {
              matrix[dayOfWeek][h].activeSeconds += perHour;
              matrix[dayOfWeek][h].mediaSeconds += perHourMedia;
              if (!matrix[dayOfWeek][h].topDomain && dayTopDomain) {
                matrix[dayOfWeek][h].topDomain = dayTopDomain;
              }
            }
          }
        }
```

---

## 🛡️ 5. Constraints & Architectural Invariants
- Zero innerHTML or unsafe string concatenation.
- Seamless compatibility with both pure telemetry objects and legacy domain-only records.
- Preserve 7x24 matrix shape `[7][24]` exactly.
- Preserve UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).

---

## 📦 6. Deliverables Manifest
- Updated [`src/dashboard/features/temporal_productivity_feature.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/temporal_productivity_feature.js).

---

## 🚦 7. Verification Gate
```powershell
node -e "const mod = require('./src/dashboard/features/temporal_productivity_feature.js'); console.log('temporal feature syntax OK');"
```
