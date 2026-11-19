# Technical Requirements Document (TRD): Accurate Hourly Activity Tracking

> **Document Type:** Technical Architecture & Interface Specification  
> **Workspace Container:** `temp_prompt/chrono_heatmap_hourly_tracking/`  
> **Target Subsystems:** `background.js`, `dashboard/dashboard.js`, `src/dashboard/features/temporal_productivity_feature.js`  
> **Author:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  

---

## 🏗️ 1. Technical Architecture & Data Schemas

### 1.1 Backend Storage Data Contract (`activityData`)
Under `chrome.storage.local.get(CONFIG.STORAGE_KEY)`:

```typescript
interface DomainEntry {
  favicon: string;
  totalSeconds: number;
  foregroundSeconds: number;
  backgroundMediaSeconds: number;
  sessionCount: number;
  lastActive: number;
  days: {
    [dateString: string]: DayStats; // Keyed YYYY-MM-DD
  };
}

interface DayStats {
  seconds: number;
  foregroundSeconds: number;
  backgroundMediaSeconds: number;
  sessions: number;
  hourlyBuckets?: {
    [hour: number | string]: HourlyBucket; // Keys 0..23
  };
}

interface HourlyBucket {
  activeSeconds: number;
  activeTime?: number; // Alias for 100% compatibility
  backgroundMediaSeconds: number;
  mediaTime?: number; // Alias for 100% compatibility
  sessions: number;
}
```

---

## ⚙️ 2. Detailed Technical Design & Code Specifications

### 2.1 Service Worker Telemetry (`background.js`)

#### A. In `commitActiveInterval()` (around line 2886):
```javascript
    if (!domainEntry.days[today]) {
      domainEntry.days[today] = { seconds: 0, foregroundSeconds: 0, backgroundMediaSeconds: 0, sessions: 1 };
    }
    const dayEntry = domainEntry.days[today];
    dayEntry.seconds += validSec;
    dayEntry.foregroundSeconds = (dayEntry.foregroundSeconds || 0) + validSec;

    // Real-time hourly bucket telemetry
    if (!dayEntry.hourlyBuckets) {
      dayEntry.hourlyBuckets = {};
    }
    const currentHour = new Date(now).getHours();
    if (!dayEntry.hourlyBuckets[currentHour]) {
      dayEntry.hourlyBuckets[currentHour] = {
        activeSeconds: 0,
        activeTime: 0,
        backgroundMediaSeconds: 0,
        mediaTime: 0,
        sessions: 1
      };
    }
    const bucket = dayEntry.hourlyBuckets[currentHour];
    bucket.activeSeconds = (bucket.activeSeconds || 0) + validSec;
    bucket.activeTime = bucket.activeSeconds;
```

#### B. In `commitBackgroundMediaDelta(domain, seconds)` (around line 2930):
```javascript
  if (!domainEntry.days[today]) {
    domainEntry.days[today] = { seconds: 0, foregroundSeconds: 0, backgroundMediaSeconds: 0, sessions: 1 };
  }
  const dayEntry = domainEntry.days[today];
  dayEntry.seconds += validSec;
  dayEntry.backgroundMediaSeconds = (dayEntry.backgroundMediaSeconds || 0) + validSec;

  // Real-time hourly bucket telemetry
  if (!dayEntry.hourlyBuckets) {
    dayEntry.hourlyBuckets = {};
  }
  const currentHour = new Date(now).getHours();
  if (!dayEntry.hourlyBuckets[currentHour]) {
    dayEntry.hourlyBuckets[currentHour] = {
      activeSeconds: 0,
      activeTime: 0,
      backgroundMediaSeconds: 0,
      mediaTime: 0,
      sessions: 0
    };
  }
  const bucket = dayEntry.hourlyBuckets[currentHour];
  bucket.backgroundMediaSeconds = (bucket.backgroundMediaSeconds || 0) + validSec;
  bucket.mediaTime = bucket.backgroundMediaSeconds;
```

---

### 2.2 Dashboard Bridge History Aggregation (`dashboard/dashboard.js`)

In `renderChronoHeatmapDashboard()` (around line 2833–2858):

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

              // Maintain domain competition for accurate topDomain selection
              if (!historyMap[dateStr]._hourlyDomainTimes[h]) {
                historyMap[dateStr]._hourlyDomainTimes[h] = {};
              }
              const times = historyMap[dateStr]._hourlyDomainTimes[h];
              times[dom] = (times[dom] || 0) + bTotal;

              // Check if this domain is now the top domain for hour h
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

---

### 2.3 Temporal Feature Heatmap Logic (`src/dashboard/features/temporal_productivity_feature.js`)

In `aggregateChronoHeatmap(rawHistory, range)` (lines 398–446):

```javascript
        // Check if hourlyBuckets exists and contains actual data (> 0 seconds)
        let hasHourlyTelemetry = false;
        if (dayData.hourlyBuckets && typeof dayData.hourlyBuckets === 'object') {
          const keys = Object.keys(dayData.hourlyBuckets);
          if (keys.length > 0) {
            hasHourlyTelemetry = keys.some(k => {
              const b = dayData.hourlyBuckets[k];
              return b && ((b.activeTime || b.activeSeconds || 0) > 0 || (b.mediaTime || b.mediaSeconds || 0) > 0);
            });
          }
        }

        if (hasHourlyTelemetry) {
          for (let h = 0; h < 24; h++) {
            const bucket = dayData.hourlyBuckets[h];
            if (bucket) {
              const act = bucket.activeTime || bucket.activeSeconds || 0;
              const med = bucket.mediaTime || bucket.mediaSeconds || 0;
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
            const s = (dObj && (dObj.activeTime || dObj.seconds || dObj.totalSeconds)) || 0;
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

## 🔒 3. Invariants & Code Standards Compliance

1. **Rule 28 Compliance:**
   - Both `commitActiveInterval` and `commitBackgroundMediaDelta` remain well under 45 lines each.
   - `aggregateChronoHeatmap` helper logic remains clean and readable.
2. **Backward Compatibility:**
   - Evaluates both legacy property names (`activeTime` vs `activeSeconds`, `mediaTime` vs `backgroundMediaSeconds`).
   - If an older dashboard or external caller calls `aggregateChronoHeatmap` with array data or object data without hourly buckets, fallback is guaranteed.
3. **Encoding:**
   - All files must be written or saved with UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
