# Phase 2: Data Aggregation, Calculation Algorithms & State Engine Wiring

> **Phase Identifier:** `phase_02_data_aggregation_and_state_wiring`  
> **Workspace Container:** `temp_prompt/kpi_expansion_10x2/`  
> **Assigned Role:** Level 4 Core Logic / JavaScript Engineer  
> **Target Subsystems:** `dashboard/dashboard.js`  

---

## 🎯 1. Phase Objective

Implement pure mathematical aggregation algorithms and wire the state engine in `dashboard/dashboard.js` to calculate and render the new 10x2 KPI metrics across both the **Time Tracking View** and **Media Analytics View**, strictly adhering to **Universal Rule 28** (<= 50 lines per function, nesting depth <= 3) and **W3C Trusted Types** (zero innerHTML assignment).

---

## 📋 2. Prerequisites & Inputs

- Completion of Phase 1 (`phase_01_markup_and_responsive_grid_layout.md`).
- Target file:
  - [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js#L6370-L6425) (Time Tracking render)
  - [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js#L7010-L7035) (Media Analytics render)

---

## 🛠️ 3. Surgical Step-by-Step Instructions

### Step 2.1: Add Modular Time Tracking KPI Calculation Functions in `dashboard/dashboard.js`
Introduce pure calculation helpers (each <= 40 lines):

```javascript
/**
 * Computes active domain count.
 * @param {Array<Object>} items
 * @returns {number}
 */
function computeActiveDomainsCount(items) {
  if (!Array.isArray(items)) return 0;
  return items.filter(item => item && item.computedSeconds > 0).length;
}

/**
 * Computes leisure & distraction time in seconds and percentage.
 * @param {Array<Object>} items
 * @param {number} totalSeconds
 * @returns {{ seconds: number, percent: number }}
 */
function computeDistractionStats(items, totalSeconds) {
  if (!Array.isArray(items) || !totalSeconds) return { seconds: 0, percent: 0 };
  const distractionKeywords = [
    'youtube.com', 'netflix.com', 'twitch.tv', 'reddit.com',
    'twitter.com', 'x.com', 'facebook.com', 'instagram.com',
    'tiktok.com', 'discord.com', 'spotify.com', 'primevideo.com'
  ];
  const distractionSec = items.reduce((acc, item) => {
    if (!item || !item.domain) return acc;
    const dom = item.domain.toLowerCase();
    const isLeisure = distractionKeywords.some(k => dom.includes(k)) ||
                      item.category === 'leisure' || item.category === 'entertainment';
    return isLeisure ? acc + (item.computedSeconds || 0) : acc;
  }, 0);
  const percent = totalSeconds > 0 ? Math.round((distractionSec / totalSeconds) * 100) : 0;
  return { seconds: distractionSec, percent };
}

/**
 * Computes peak browsing clock hour window.
 * @param {Object} data
 * @param {string} todayStr
 * @returns {string} e.g. "14:00 - 15:00"
 */
function computePeakActivityHour(data, todayStr) {
  if (!data) return '--:--';
  const hourlyBins = new Array(24).fill(0);
  if (data.hourlyBreakdown && data.hourlyBreakdown[todayStr]) {
    const bins = data.hourlyBreakdown[todayStr];
    Object.keys(bins).forEach(h => {
      const idx = parseInt(h, 10);
      if (idx >= 0 && idx < 24) hourlyBins[idx] += bins[h];
    });
  } else if (data.hourlyActivity && Array.isArray(data.hourlyActivity)) {
    data.hourlyActivity.forEach((sec, idx) => {
      if (idx >= 0 && idx < 24) hourlyBins[idx] += sec;
    });
  }
  let maxSec = 0, peakHour = -1;
  hourlyBins.forEach((sec, h) => {
    if (sec > maxSec) { maxSec = sec; peakHour = h; }
  });
  if (peakHour === -1 || maxSec === 0) return '--:--';
  const start = String(peakHour).padStart(2, '0') + ':00';
  const end = String((peakHour + 1) % 24).padStart(2, '0') + ':00';
  return `${start} - ${end}`;
}

/**
 * Computes longest continuous session duration in seconds.
 * @param {Object} data
 * @param {Array<Object>} items
 * @returns {number}
 */
function computeLongestContinuousSession(data, items) {
  if (data && Array.isArray(data.sessions) && data.sessions.length > 0) {
    return data.sessions.reduce((max, s) => Math.max(max, s.durationSec || 0), 0);
  }
  if (Array.isArray(items) && items.length > 0) {
    return items.reduce((max, item) => Math.max(max, item.computedSeconds || 0), 0);
  }
  return 0;
}
```

---

### Step 2.2: Add Modular Media Analytics KPI Calculation Functions in `dashboard/dashboard.js`
Introduce pure media calculation helpers (each <= 40 lines):

```javascript
/**
 * Extracts top media platform name from media history.
 * @param {Array<Object>} history
 * @returns {string}
 */
function computeTopMediaPlatform(history) {
  if (!Array.isArray(history) || history.length === 0) return '-';
  const domainTotals = {};
  history.forEach(item => {
    if (!item) return;
    let name = item.domain || item.platform;
    if (!name && item.url) {
      try { name = new URL(item.url).hostname.replace(/^www\./, ''); } catch (e) { name = 'Web'; }
    }
    name = name || 'Media';
    domainTotals[name] = (domainTotals[name] || 0) + (item.watchTimeSec || item.duration || 1);
  });
  let maxSec = 0, topPlat = '-';
  Object.keys(domainTotals).forEach(dom => {
    if (domainTotals[dom] > maxSec) { maxSec = domainTotals[dom]; topPlat = dom; }
  });
  return topPlat;
}

/**
 * Counts active live stream sessions.
 * @param {Array<Object>} activeStreams
 * @returns {number}
 */
function computeActiveLiveStreamsCount(activeStreams) {
  if (!Array.isArray(activeStreams)) return 0;
  return activeStreams.filter(s => s && (s.isLive === true || s.duration === Infinity || s.isLiveStream)).length;
}

/**
 * Counts playback sessions that were muted.
 * @param {Array<Object>} history
 * @returns {number}
 */
function computeMutedSessionsCount(history) {
  if (!Array.isArray(history)) return 0;
  return history.filter(s => s && (s.isMuted === true || s.volume === 0 || s.muted === true)).length;
}

/**
 * Finds longest single media session duration in seconds.
 * @param {Array<Object>} history
 * @returns {number}
 */
function computeLongestMediaSession(history) {
  if (!Array.isArray(history) || history.length === 0) return 0;
  return history.reduce((max, s) => Math.max(max, s.watchTimeSec || s.duration || 0), 0);
}
```

---

### Step 2.3: Wire Time Tracking DOM Updates (Trusted Types Zero-innerHTML)
In `renderTimeTrackingView` (or where metric cards are updated), update the new cards safely:

```javascript
  // 1.2 Extended Time Tracking Metrics (Row 2 KPIs)
  const elActiveDomains = document.getElementById('trackMetricActiveDomains');
  const elDistractionTime = document.getElementById('trackMetricDistractionTime');
  const elSubDistraction = document.getElementById('subMetricDistractionTime');
  const elPeakHour = document.getElementById('trackMetricPeakHour');
  const elLongestSession = document.getElementById('trackMetricLongestSession');

  if (elActiveDomains) {
    const count = computeActiveDomainsCount(stats.items);
    elActiveDomains.textContent = String(count);
  }

  if (elDistractionTime) {
    const distStats = computeDistractionStats(stats.items, stats.todaySec);
    elDistractionTime.textContent = distStats.seconds > 0 ? formatDuration(distStats.seconds) : '0h 00m';
    if (elSubDistraction) {
      elSubDistraction.textContent = `${distStats.percent}% of active time`;
    }
  }

  if (elPeakHour) {
    elPeakHour.textContent = computePeakActivityHour(data, todayStr);
  }

  if (elLongestSession) {
    const longestSec = computeLongestContinuousSession(data, stats.items);
    elLongestSession.textContent = longestSec > 0 ? formatDuration(longestSec) : '0h 00m';
  }
```

---

### Step 2.4: Wire Media Analytics DOM Updates (Trusted Types Zero-innerHTML)
In `renderMediaAnalyticsView` (or `renderMediaView`), wire the new media cards safely:

```javascript
  // 1.2 Extended Media Analytics Metrics (Row 1 & Row 2 KPIs)
  const elTopPlat = document.getElementById('mediaMetricTopPlatform');
  const elActiveStreams = document.getElementById('mediaMetricActiveStreams');
  const elMutedSess = document.getElementById('mediaMetricMutedSessions');
  const elLongestMedia = document.getElementById('mediaMetricLongestSession');

  if (elTopPlat) {
    elTopPlat.textContent = computeTopMediaPlatform(history);
  }

  if (elActiveStreams) {
    const activeStreamsList = (typeof activeMediaStreams !== 'undefined' && Array.isArray(activeMediaStreams)) 
      ? activeMediaStreams 
      : [];
    elActiveStreams.textContent = String(computeActiveLiveStreamsCount(activeStreamsList));
  }

  if (elMutedSess) {
    elMutedSess.textContent = String(computeMutedSessionsCount(history));
  }

  if (elLongestMedia) {
    const longestSec = computeLongestMediaSession(history);
    elLongestMedia.textContent = longestSec > 0 ? formatDuration(longestSec) : '0m 00s';
  }
```

---

## 🔒 4. Constraints & Invariants

- **Universal Rule 28:** All newly introduced and modified functions MUST NOT exceed 50 lines. Keep nesting depth <= 3.
- **Zero-innerHTML Security:** Never assign to `.innerHTML` or `.outerHTML`. Use `.textContent` exclusively for all value and label updates.
- **Null Safety:** Guard all DOM elements with `if (el) { ... }` checks to prevent runtime errors during unit tests and partial renders.
- **Preserve UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).**

---

## 📦 5. Deliverables Manifest

- `dashboard/dashboard.js` (Implemented calculation algorithms and wired DOM updates for all 20 KPI cards)

---

## ✅ 6. Local Verification Gate

```powershell
node -e "
const fs = require('fs');
const js = fs.readFileSync('dashboard/dashboard.js', 'utf8');
const hasActiveDomains = js.includes('computeActiveDomainsCount');
const hasTopPlatform = js.includes('computeTopMediaPlatform');
const hasInnerHtmlViolation = /trackMetricActiveDomains.*\.innerHTML/.test(js);
console.log('Wiring check - ActiveDomains:', hasActiveDomains, 'TopPlatform:', hasTopPlatform, 'InnerHtmlViolation:', hasInnerHtmlViolation);
if (!hasActiveDomains || !hasTopPlatform || hasInnerHtmlViolation) process.exit(1);
"
```
