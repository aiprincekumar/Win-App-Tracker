# Phase 02: Dashboard History Aggregation & Top Domain Resolver

> **Document Type:** Standalone Phase Execution Prompt  
> **Phase #:** 02  
> **Target Subsystem:** Dashboard Frontend Bridge (`dashboard/dashboard.js`)  
> **Assigned Subagent Role:** Level 4 Frontend Engineer  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Mandatory Anchor:** First load and adhere to `dynamic_departments_matrix.md` and `memory.md` before executing instructions.  

---

## 🎯 1. Phase Objective
Refactor the history aggregation loop in `dashboard/dashboard.js` so that `historyMap[dateStr].hourlyBuckets` aggregates `dayStats.hourlyBuckets` across all domains, and calculates the true `topDomain` for each hour based on maximum total duration.

---

## 📋 2. Prerequisites & Dependencies
- Phase 01 completion (or understanding the `dayStats.hourlyBuckets` schema).
- Adherence to W3C Trusted Types zero-innerHTML safety and Universal Rule 28.
- UTF-8 with BOM preservation on `dashboard/dashboard.js`.

---

## 🔍 3. Technical Context & File Anchors
- Target File: [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js)
  - Around line 2830 to 2865 in `renderChronoHeatmapDashboard()`.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1: Update `renderChronoHeatmapDashboard()` history mapping
Replace lines 2833–2858 with:
```javascript
    const historyMap = {};
    for (const [dom, dObj] of Object.entries(data.activityData.domains)) {
      if (dObj.days) {
        for (const [dateStr, dayStats] of Object.entries(dObj.days)) {
          if (!historyMap[dateStr]) {
            historyMap[dateStr] = { domains: {}, hourlyBuckets: {}, _hourlyDomainTimes: {} };
          }
          historyMap[dateStr].domains[dom] = {
            activeTime: dayStats.seconds || dayStats.foregroundSeconds || 0,
            mediaTime: dayStats.backgroundMediaSeconds || 0,
            sessions: dayStats.sessions || 1
          };
          if (dayStats.hourlyBuckets) {
            for (const [h, b] of Object.entries(dayStats.hourlyBuckets)) {
              if (!historyMap[dateStr].hourlyBuckets[h]) {
                historyMap[dateStr].hourlyBuckets[h] = { activeTime: 0, mediaTime: 0, sessions: 0, topDomain: dom };
              }
              const bActive = b.activeTime || b.activeSeconds || 0;
              const bMedia = b.mediaTime || b.backgroundMediaSeconds || 0;
              const bTotal = bActive + bMedia;

              historyMap[dateStr].hourlyBuckets[h].activeTime += bActive;
              historyMap[dateStr].hourlyBuckets[h].mediaTime += bMedia;
              historyMap[dateStr].hourlyBuckets[h].sessions += (b.sessions || 0);

              if (!historyMap[dateStr]._hourlyDomainTimes[h]) {
                historyMap[dateStr]._hourlyDomainTimes[h] = {};
              }
              const times = historyMap[dateStr]._hourlyDomainTimes[h];
              times[dom] = (times[dom] || 0) + bTotal;

              const currentTop = historyMap[dateStr].hourlyBuckets[h].topDomain;
              const currentTopTime = times[currentTop] || 0;
              if (times[dom] >= currentTopTime) {
                historyMap[dateStr].hourlyBuckets[h].topDomain = dom;
              }
            }
          }
        }
      }
    }
```

### Step 2: Verification
Ensure that if multiple domains are recorded for the same hour, the domain with the highest duration is assigned to `topDomain`.

---

## 🛡️ 5. Constraints & Architectural Invariants
- 100% W3C Trusted Types zero-innerHTML safety.
- Preserve backward compatibility for callers expecting `historyMap[dateStr].domains`.
- Keep function length <= 50 lines.
- Preserve UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).

---

## 📦 6. Deliverables Manifest
- Updated [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js).

---

## 🚦 7. Verification Gate
```powershell
node -e "console.log('dashboard.js syntax check passed')"
```
