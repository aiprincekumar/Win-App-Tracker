# Technical Requirements Document (TRD): 10x2 KPI Expansion

> **Workspace Container:** `temp_prompt/kpi_expansion_10x2/`  
> **Initiative:** Web Activity & Media Sentinel 10x2 Dashboard KPI Architecture  
> **Owner:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  

---

## 🏗️ 1. High-Level Architecture & Component Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DASHBOARD RUNTIME                                │
│                                                                             │
│  ┌─────────────────────────┐           ┌─────────────────────────────────┐  │
│  │   Time Tracking Engine  │           │     Media Analytics Engine      │  │
│  │    (dashboard.js)       │           │         (dashboard.js)          │  │
│  └───────────┬─────────────┘           └────────────────┬────────────────┘  │
│              │                                          │                   │
│              ▼                                          ▼                   │
│  ┌─────────────────────────┐           ┌─────────────────────────────────┐  │
│  │  calculateTimeKpis10()  │           │     calculateMediaKpis10()      │  │
│  └───────────┬─────────────┘           └────────────────┬────────────────┘  │
│              │                                          │                   │
│              ▼                                          ▼                   │
│  ┌─────────────────────────┐           ┌─────────────────────────────────┐  │
│  │  #trackingMetricsGrid   │           │       #mediaMetricsGrid         │  │
│  │    (.kpi-grid-5x2)      │           │        (.kpi-grid-5x2)          │  │
│  │   [ 10 Liquid Cards ]   │           │      [ 10 Liquid Cards ]        │  │
│  └─────────────────────────┘           └─────────────────────────────────┘  │
│              │                                          │                   │
│              └────────────────────┬─────────────────────┘                   │
│                                   │                                         │
│                                   ▼                                         │
│                      ┌────────────────────────┐                             │
│                      │  Trusted Types / W3C   │                             │
│                      │   textContent only     │                             │
│                      └────────────────────────┘                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ 2. Comprehensive DOM Specification (20 KPI Cards)

### 2.1 Tab A: Time Tracking View (`#trackingMetricsGrid`)

Container:
`<div class="metrics-grid kpi-grid-5x2 bento-span-12" id="trackingMetricsGrid" role="region" aria-label="Key Performance Indicators">`

| Card # | Row | Label Element ID | Value Element ID | Subtitle Element ID | Icon Box Color | Icon | Purpose |
| :---: | :---: | :--- | :--- | :--- | :---: | :---: | :--- |
| **1** | 1 | `lblMetricToday` | `trackMetricTodayTime` | `lblMetricTodaySub` | `cyan` | ⏱️ | Today's active browsing duration |
| **2** | 1 | `lblMetricDaily` | `trackMetricDailyAvg` | `trackMetricHistoryDays` | `emerald` | 📊 | Daily historical average |
| **3** | 1 | `lblMetricTotal` | `trackMetricTotalTime` | `trackMetricFirstDate` | `violet` | ⏳ | Cumulative tracked browsing time |
| **4** | 1 | `lblProductivityScore` | `valProductivityScore` | `badgeProductivityTier` | `emerald` | 🎯 | Productivity Index & SVG Radial Gauge |
| **5** | 1 | `lblMetricFocus` | `trackMetricFocusTime` | `trackMetricFocusSessions` | `indigo` | 🧘 | Deep focus duration & completed sessions |
| **6** | 2 | `lblMetricTopDomain` | `trackMetricTopDomain` | `trackMetricTopDomainTime` | `amber` | 🏆 | Top visited website & percentage |
| **7** | 2 | `lblMetricActiveDomains` | `trackMetricActiveDomains` | `subMetricActiveDomains` | `teal` | 🌐 | Count of active domains visited today |
| **8** | 2 | `lblMetricDistractionTime` | `trackMetricDistractionTime` | `subMetricDistractionTime` | `rose` | ⚠️ | Distraction / leisure activity time |
| **9** | 2 | `lblMetricPeakHour` | `trackMetricPeakHour` | `subMetricPeakHour` | `blue` | ⏰ | Clock hour with highest browsing activity |
| **10** | 2 | `lblMetricLongestSession` | `trackMetricLongestSession` | `subMetricLongestSession` | `fuchsia` | 🚀 | Longest continuous browsing session |

---

### 2.2 Tab B: Media Analytics View (`#mediaMetricsGrid`)

Container:
`<div class="metrics-grid kpi-grid-5x2 bento-span-12" id="mediaMetricsGrid" role="region" aria-label="Media Performance Indicators">`

| Card # | Row | Label Element ID | Value Element ID | Subtitle Element ID | Icon Box Color | Icon | Purpose |
| :---: | :---: | :--- | :--- | :--- | :---: | :---: | :--- |
| **1** | 1 | `lblMediaTotalWatch` | `mediaMetricTotalWatch` | `subMediaTotalWatch` | `rose` | 🎬 | Total video/audio watch time |
| **2** | 1 | `lblMediaAvgWatch` | `mediaMetricAvgWatch` | `subMediaAvgWatch` | `cyan` | ⏱️ | Average watch time per media item |
| **3** | 1 | `lblMediaSessions` | `mediaMetricSessionsCount` | `subMediaSessions` | `blue` | 🎞️ | Total media sessions recorded |
| **4** | 1 | `lblMediaTopPlatform` | `mediaMetricTopPlatform` | `subMediaTopPlatform` | `amber` | 📺 | Dominant streaming platform |
| **5** | 1 | `lblMediaActiveStreams` | `mediaMetricActiveStreams` | `subMediaActiveStreams` | `emerald` | 📡 | Count of active live streams |
| **6** | 2 | `lblMediaAvgVolume` | `mediaMetricAvgVolume` | `subMediaAvgVolume` | `emerald` | 🔊 | Mean playback volume |
| **7** | 2 | `lblMediaPeakVolume` | `mediaMetricPeakVolume` | `subMediaPeakVolume` | `amber` | ⚡ | Peak volume level recorded |
| **8** | 2 | `lblMediaLowVolume` | `mediaMetricLowVolume` | `subMediaLowVolume` | `violet` | 🔉 | Lowest volume level recorded |
| **9** | 2 | `lblMediaMutedSessions` | `mediaMetricMutedSessions` | `subMediaMutedSessions` | `rose` | 🔇 | Muted playback sessions count |
| **10** | 2 | `lblMediaLongestSession` | `mediaMetricLongestSession` | `subMediaLongestSession` | `indigo` | ⏳ | Longest single media session |

---

## 🧮 3. Mathematical Aggregation Algorithms (dashboard.js)

To satisfy **Universal Rule 28** (all functions strictly <= 50 lines), calculation logic is decomposed into dedicated pure domain functions:

### 3.1 Time Tracking Aggregation Functions

```javascript
/**
 * Computes active domain count for the active temporal range.
 * @param {Array<Object>} items - Array of domain stats items.
 * @returns {number}
 */
function computeActiveDomainsCount(items) {
  if (!Array.isArray(items)) return 0;
  return items.filter(item => item && item.computedSeconds > 0).length;
}

/**
 * Computes distraction/leisure time in seconds.
 * Known leisure domains or flagged categories.
 * @param {Array<Object>} items 
 * @returns {{ seconds: number, percent: number }}
 */
function computeDistractionTime(items, totalSeconds) {
  if (!Array.isArray(items) || !totalSeconds) return { seconds: 0, percent: 0 };
  const distractionKeywords = [
    'youtube.com', 'netflix.com', 'twitch.tv', 'reddit.com', 
    'twitter.com', 'x.com', 'facebook.com', 'instagram.com', 
    'tiktok.com', 'discord.com', 'spotify.com', 'primevideo.com'
  ];
  const distractionSec = items.reduce((acc, item) => {
    if (!item || !item.domain) return acc;
    const isDistraction = distractionKeywords.some(k => item.domain.toLowerCase().includes(k)) ||
                          item.category === 'leisure' || item.category === 'entertainment';
    return isDistraction ? acc + (item.computedSeconds || 0) : acc;
  }, 0);
  const percent = totalSeconds > 0 ? Math.round((distractionSec / totalSeconds) * 100) : 0;
  return { seconds: distractionSec, percent };
}

/**
 * Computes peak activity hour from activityData hourly buckets or intervals.
 * @param {Object} activityData 
 * @param {string} todayStr 
 * @returns {string} e.g. "14:00 - 15:00" or "2 PM - 3 PM"
 */
function computePeakActivityHour(activityData, todayStr) {
  if (!activityData) return '--:--';
  const hourlyBins = new Array(24).fill(0);
  // Aggregate from hourly breakdown if present in activityData
  if (activityData.hourlyBreakdown && activityData.hourlyBreakdown[todayStr]) {
    const bins = activityData.hourlyBreakdown[todayStr];
    Object.keys(bins).forEach(h => {
      const idx = parseInt(h, 10);
      if (idx >= 0 && idx < 24) hourlyBins[idx] += bins[h];
    });
  }
  let maxSec = 0, peakHour = -1;
  hourlyBins.forEach((sec, h) => {
    if (sec > maxSec) { maxSec = sec; peakHour = h; }
  });
  if (peakHour === -1) return '--:--';
  const start = String(peakHour).padStart(2, '0') + ':00';
  const end = String((peakHour + 1) % 24).padStart(2, '0') + ':00';
  return `${start} - ${end}`;
}

/**
 * Computes longest continuous browsing session.
 * @param {Object} activityData 
 * @returns {number} seconds
 */
function computeLongestContinuousSession(activityData) {
  if (!activityData || !Array.isArray(activityData.sessions)) return 0;
  return activityData.sessions.reduce((max, s) => Math.max(max, s.durationSec || 0), 0);
}
```

### 3.2 Media Analytics Aggregation Functions

```javascript
/**
 * Determines top media platform by aggregated watch seconds.
 * @param {Array<Object>} history 
 * @returns {string} Platform name e.g. "YouTube"
 */
function computeTopMediaPlatform(history) {
  if (!Array.isArray(history) || history.length === 0) return 'None';
  const map = {};
  history.forEach(item => {
    if (!item) return;
    const domain = item.domain || item.platform || (item.url ? extractDomain(item.url) : 'Unknown');
    map[domain] = (map[domain] || 0) + (item.watchTimeSec || item.duration || 0);
  });
  let maxSec = 0, topPlat = 'None';
  Object.keys(map).forEach(dom => {
    if (map[dom] > maxSec) { maxSec = map[dom]; topPlat = dom; }
  });
  return cleanPlatformName(topPlat);
}

/**
 * Counts currently active live streams.
 * @param {Array<Object>} activeStreams 
 * @returns {number}
 */
function computeActiveLiveStreamsCount(activeStreams) {
  if (!Array.isArray(activeStreams)) return 0;
  return activeStreams.filter(s => s && (s.isLive === true || s.duration === Infinity || s.isLiveStream)).length;
}

/**
 * Counts muted playback sessions in history.
 * @param {Array<Object>} history 
 * @returns {number}
 */
function computeMutedSessionsCount(history) {
  if (!Array.isArray(history)) return 0;
  return history.filter(s => s && (s.isMuted === true || s.volume === 0 || s.muted === true)).length;
}

/**
 * Finds longest single media session.
 * @param {Array<Object>} history 
 * @returns {number} seconds
 */
function computeLongestMediaSession(history) {
  if (!Array.isArray(history) || history.length === 0) return 0;
  return history.reduce((max, s) => Math.max(max, s.watchTimeSec || s.duration || 0), 0);
}
```

---

## 🎨 4. CSS Grid Layout Blueprint (`dashboard.css`)

```css
/* 5x2 Symmetrical KPI Grid */
.kpi-grid-5x2 {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px;
  width: 100%;
}

/* Tablet / Laptop Breakpoint (3 Columns) */
@media (max-width: 1200px) {
  .kpi-grid-5x2 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

/* Compact Tablet Breakpoint (2 Columns) */
@media (max-width: 768px) {
  .kpi-grid-5x2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
}

/* Mobile Breakpoint (1 Column) */
@media (max-width: 480px) {
  .kpi-grid-5x2 {
    grid-template-columns: 1fr;
  }
}
```

---

## 🔒 5. Trusted Types Security & Rule 28 Compliance

1. **Zero-innerHTML DOM Assignment:**
   All updates must strictly operate through `.textContent`:
   ```javascript
   elActiveDomains.textContent = String(activeDomainsCount);
   elDistractionTime.textContent = formatDuration(distraction.seconds);
   elPeakHour.textContent = peakHourStr;
   elLongestSession.textContent = formatDuration(longestSessionSec);
   ```
2. **Radial Gauge SVG Security:**
   The Productivity Index radial gauge updates attributes directly:
   `gaugeCircle.setAttribute('stroke-dashoffset', String(newOffset));`
3. **Strict Function Size Limits:**
   Each function in `dashboard.js` must be under 50 lines. Large render routines must delegate to the pure mathematical calculators defined in Section 3.
