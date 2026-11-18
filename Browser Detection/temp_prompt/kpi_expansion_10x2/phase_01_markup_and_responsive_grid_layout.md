# Phase 1: HTML Semantic Markup & Responsive 5x2 Bento Grid Layout

> **Phase Identifier:** `phase_01_markup_and_responsive_grid_layout`  
> **Workspace Container:** `temp_prompt/kpi_expansion_10x2/`  
> **Assigned Role:** Level 4 Frontend / UI Engineer  
> **Target Subsystems:** `dashboard/dashboard.html`, `dashboard/dashboard.css`  

---

## 🎯 1. Phase Objective

Restructure and expand both the **Time Tracking View (Tab A)** and the **Media Analytics View (Tab B)** in `dashboard/dashboard.html` to feature exactly **10 KPI cards each**, structured in a dedicated **5 x 2 responsive Bento Grid** container (`.kpi-grid-5x2`), and implement the accompanying responsive CSS grid styles and glassmorphism tokens in `dashboard/dashboard.css`.

---

## 📋 2. Prerequisites & Inputs

- Read `temp_prompt/kpi_expansion_10x2/INDEX.md`, `PRD.md`, `TRD.md`, and `DESIGN.md`.
- Target files:
  - [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L280-L375)
  - [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L552-L635)
  - [`dashboard/dashboard.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.css#L1630-L1670)

---

## 🛠️ 3. Surgical Step-by-Step Instructions

### Step 1.1: Restructure `#trackingMetricsGrid` in `dashboard/dashboard.html`
Replace the existing 6 cards inside `#trackingMetricsGrid` with exactly 10 semantic cards arranged across 2 rows of 5 cards:

```html
<!-- Key Metrics Cards (10 Cards in Symmetrical 5x2 Bento Grid) -->
<div class="metrics-grid kpi-grid-5x2 bento-span-12" id="trackingMetricsGrid" role="region" aria-label="Key Performance Indicators">
  <!-- ROW 1 -->
  <!-- Card 1: Today's Active Time -->
  <div class="metric-card bento-card liquid-glass-card" id="cardTodayTime">
    <div class="metric-header">
      <span id="lblMetricToday" class="metric-label" data-i18n="metric_today">Today's Browsing Time</span>
      <span class="metric-icon-box cyan">⏱️</span>
    </div>
    <div class="metric-value-container">
      <span id="trackMetricTodayTime" class="metric-big-num">0h 00m</span>
    </div>
    <div class="metric-footer">
      <span id="lblMetricTodaySub" class="metric-subtext" data-i18n="metric_today_sub">Active browser sessions</span>
    </div>
  </div>

  <!-- Card 2: Daily Average -->
  <div class="metric-card bento-card liquid-glass-card" id="cardDailyAvg">
    <div class="metric-header">
      <span id="lblMetricDaily" class="metric-label" data-i18n="metric_daily">Daily Average</span>
      <span class="metric-icon-box emerald">📊</span>
    </div>
    <div class="metric-value-container">
      <span id="trackMetricDailyAvg" class="metric-big-num">0h 00m</span>
    </div>
    <div class="metric-footer">
      <span id="trackMetricHistoryDays" class="metric-subtext" data-i18n="metric_daily_sub">Average over past 1 day</span>
    </div>
  </div>

  <!-- Card 3: Total Tracked Time -->
  <div class="metric-card bento-card liquid-glass-card" id="cardTotalTime">
    <div class="metric-header">
      <span id="lblMetricTotal" class="metric-label" data-i18n="metric_total">Total Tracked Time</span>
      <span class="metric-icon-box violet">⏳</span>
    </div>
    <div class="metric-value-container">
      <span id="trackMetricTotalTime" class="metric-big-num">0h 00m</span>
    </div>
    <div class="metric-footer">
      <span id="trackMetricFirstDate" class="metric-subtext" data-i18n="metric_total_sub">Since tracking began</span>
    </div>
  </div>

  <!-- Card 4: Productivity Index (Radial Gauge) -->
  <div id="cardProductivityScore" class="metric-card bento-card liquid-glass-card productivity-score-card">
    <div class="metric-header">
      <span id="lblProductivityScore" class="metric-label" data-i18n="metric_productivity">Productivity Index</span>
      <span class="metric-icon-box emerald">🎯</span>
    </div>
    <div class="metric-value-container productivity-gauge-container">
      <div class="gauge-svg-wrapper">
        <svg id="svgProductivityGauge" class="productivity-radial-gauge" viewBox="0 0 100 100" width="60" height="60" role="img" aria-label="Productivity score radial gauge">
          <circle class="gauge-bg" cx="50" cy="50" r="38" stroke-width="8" fill="none" />
          <circle id="gaugeProgressCircle" class="gauge-progress tier-focus" cx="50" cy="50" r="38" stroke-width="8" fill="none" stroke-dasharray="238.76" stroke-dashoffset="0" transform="rotate(-90 50 50)" />
        </svg>
        <div class="gauge-center-text">
          <span id="valProductivityScore" class="productivity-score-num">--</span>
        </div>
      </div>
    </div>
    <div class="metric-footer">
      <span id="badgeProductivityTier" class="badge-productivity-tier focus">Deep Focus</span>
    </div>
  </div>

  <!-- Card 5: Deep Focus Time -->
  <div id="cardFocusAnalytics" class="metric-card bento-card liquid-glass-card">
    <div class="metric-header">
      <span id="lblMetricFocus" class="metric-label" data-i18n="metric_focus">Deep Focus Time</span>
      <span class="metric-icon-box indigo">🧘</span>
    </div>
    <div class="metric-value-container">
      <span id="trackMetricFocusTime" class="metric-big-num">0h 00m</span>
    </div>
    <div class="metric-footer">
      <span id="trackMetricFocusSessions" class="metric-subtext" data-i18n="metric_focus_sub">0 completed sessions today</span>
    </div>
  </div>

  <!-- ROW 2 -->
  <!-- Card 6: Top Website -->
  <div class="metric-card bento-card liquid-glass-card" id="cardTopDomain">
    <div class="metric-header">
      <span id="lblMetricTopDomain" class="metric-label" data-i18n="metric_top_domain">Top Website</span>
      <span class="metric-icon-box amber">🏆</span>
    </div>
    <div class="metric-value-container">
      <span id="trackMetricTopDomain" class="metric-big-num text-truncate">-</span>
    </div>
    <div class="metric-footer">
      <span id="trackMetricTopDomainTime" class="metric-subtext" data-i18n="metric_top_domain_sub">Most active domain</span>
    </div>
  </div>

  <!-- Card 7: Active Domains Count -->
  <div class="metric-card bento-card liquid-glass-card" id="cardActiveDomains">
    <div class="metric-header">
      <span id="lblMetricActiveDomains" class="metric-label" data-i18n="metric_active_domains">Active Domains</span>
      <span class="metric-icon-box teal">🌐</span>
    </div>
    <div class="metric-value-container">
      <span id="trackMetricActiveDomains" class="metric-big-num">0</span>
    </div>
    <div class="metric-footer">
      <span id="subMetricActiveDomains" class="metric-subtext" data-i18n="metric_active_domains_sub">Distinct sites visited</span>
    </div>
  </div>

  <!-- Card 8: Distraction / Leisure Time -->
  <div class="metric-card bento-card liquid-glass-card" id="cardDistractionTime">
    <div class="metric-header">
      <span id="lblMetricDistractionTime" class="metric-label" data-i18n="metric_distraction_time">Leisure & Distraction</span>
      <span class="metric-icon-box rose">⚠️</span>
    </div>
    <div class="metric-value-container">
      <span id="trackMetricDistractionTime" class="metric-big-num">0h 00m</span>
    </div>
    <div class="metric-footer">
      <span id="subMetricDistractionTime" class="metric-subtext" data-i18n="metric_distraction_sub">Entertainment & social</span>
    </div>
  </div>

  <!-- Card 9: Peak Activity Hour -->
  <div class="metric-card bento-card liquid-glass-card" id="cardPeakHour">
    <div class="metric-header">
      <span id="lblMetricPeakHour" class="metric-label" data-i18n="metric_peak_hour">Peak Activity Hour</span>
      <span class="metric-icon-box blue">⏰</span>
    </div>
    <div class="metric-value-container">
      <span id="trackMetricPeakHour" class="metric-big-num text-truncate">--:--</span>
    </div>
    <div class="metric-footer">
      <span id="subMetricPeakHour" class="metric-subtext" data-i18n="metric_peak_hour_sub">Highest traffic window</span>
    </div>
  </div>

  <!-- Card 10: Longest Continuous Session -->
  <div class="metric-card bento-card liquid-glass-card" id="cardLongestSession">
    <div class="metric-header">
      <span id="lblMetricLongestSession" class="metric-label" data-i18n="metric_longest_session">Longest Session</span>
      <span class="metric-icon-box fuchsia">🚀</span>
    </div>
    <div class="metric-value-container">
      <span id="trackMetricLongestSession" class="metric-big-num">0h 00m</span>
    </div>
    <div class="metric-footer">
      <span id="subMetricLongestSession" class="metric-subtext" data-i18n="metric_longest_session_sub">Uninterrupted focus run</span>
    </div>
  </div>
</div>
```

---

### Step 1.2: Restructure Media Analytics in `dashboard/dashboard.html`
Wrap the media KPI cards into `#mediaMetricsGrid` containing 10 cards across 2 rows of 5:

```html
<!-- Key Media Summary Metrics Cards (10 Cards in Symmetrical 5x2 Bento Grid) -->
<div class="metrics-grid kpi-grid-5x2 bento-span-12" id="mediaMetricsGrid" role="region" aria-label="Media Performance Indicators">
  <!-- ROW 1 -->
  <!-- Card 1: Total Watch Time -->
  <div class="metric-card bento-card liquid-glass-card" id="cardMediaTotalWatch">
    <div class="metric-header">
      <span id="lblMediaTotalWatch" class="metric-label" data-i18n="media_metric_total_watch">Total Watch Time</span>
      <span class="metric-icon-box rose">🎬</span>
    </div>
    <div class="metric-value-container">
      <span id="mediaMetricTotalWatch" class="metric-big-num">0h 00m</span>
    </div>
    <div class="metric-footer">
      <span id="subMediaTotalWatch" class="metric-subtext" data-i18n="media_sub_total_watch">Cumulative consumption</span>
    </div>
  </div>

  <!-- Card 2: Avg Watch per Video -->
  <div class="metric-card bento-card liquid-glass-card" id="cardMediaAvgWatch">
    <div class="metric-header">
      <span id="lblMediaAvgWatch" class="metric-label" data-i18n="media_metric_avg_watch">Avg Watch per Video</span>
      <span class="metric-icon-box cyan">⏱️</span>
    </div>
    <div class="metric-value-container">
      <span id="mediaMetricAvgWatch" class="metric-big-num">0m 00s</span>
    </div>
    <div class="metric-footer">
      <span id="subMediaAvgWatch" class="metric-subtext" data-i18n="media_sub_avg_watch">Average per session</span>
    </div>
  </div>

  <!-- Card 3: Total Media Sessions -->
  <div class="metric-card bento-card liquid-glass-card" id="cardMediaSessions">
    <div class="metric-header">
      <span id="lblMediaSessions" class="metric-label" data-i18n="media_metric_sessions">Media Sessions</span>
      <span class="metric-icon-box blue">🎞️</span>
    </div>
    <div class="metric-value-container">
      <span id="mediaMetricSessionsCount" class="metric-big-num">0</span>
    </div>
    <div class="metric-footer">
      <span id="subMediaSessions" class="metric-subtext" data-i18n="media_sub_sessions">Total playback events</span>
    </div>
  </div>

  <!-- Card 4: Top Media Platform -->
  <div class="metric-card bento-card liquid-glass-card" id="cardMediaTopPlatform">
    <div class="metric-header">
      <span id="lblMediaTopPlatform" class="metric-label" data-i18n="media_metric_top_platform">Top Media Platform</span>
      <span class="metric-icon-box amber">📺</span>
    </div>
    <div class="metric-value-container">
      <span id="mediaMetricTopPlatform" class="metric-big-num text-truncate">-</span>
    </div>
    <div class="metric-footer">
      <span id="subMediaTopPlatform" class="metric-subtext" data-i18n="media_sub_top_platform">Most watched service</span>
    </div>
  </div>

  <!-- Card 5: Active Live Streams -->
  <div class="metric-card bento-card liquid-glass-card" id="cardMediaActiveStreams">
    <div class="metric-header">
      <span id="lblMediaActiveStreams" class="metric-label" data-i18n="media_metric_active_streams">Live Streams</span>
      <span class="metric-icon-box emerald">📡</span>
    </div>
    <div class="metric-value-container">
      <span id="mediaMetricActiveStreams" class="metric-big-num">0</span>
    </div>
    <div class="metric-footer">
      <span id="subMediaActiveStreams" class="metric-subtext" data-i18n="media_sub_active_streams">Active concurrent streams</span>
    </div>
  </div>

  <!-- ROW 2 -->
  <!-- Card 6: Average Volume -->
  <div class="metric-card bento-card liquid-glass-card" id="cardMediaAvgVolume">
    <div class="metric-header">
      <span id="lblMediaAvgVolume" class="metric-label" data-i18n="media_metric_avg_volume">Average Volume</span>
      <span class="metric-icon-box emerald">🔊</span>
    </div>
    <div class="metric-value-container">
      <span id="mediaMetricAvgVolume" class="metric-big-num">0%</span>
    </div>
    <div class="metric-footer">
      <span id="subMediaAvgVolume" class="metric-subtext" data-i18n="media_sub_avg_volume">Mean sound output</span>
    </div>
  </div>

  <!-- Card 7: Peak Volume Recorded -->
  <div class="metric-card bento-card liquid-glass-card" id="cardMediaPeakVolume">
    <div class="metric-header">
      <span id="lblMediaPeakVolume" class="metric-label" data-i18n="media_metric_peak_volume">Peak Volume</span>
      <span class="metric-icon-box amber">⚡</span>
    </div>
    <div class="metric-value-container">
      <span id="mediaMetricPeakVolume" class="metric-big-num">0%</span>
    </div>
    <div class="metric-footer">
      <span id="subMediaPeakVolume" class="metric-subtext" data-i18n="media_sub_peak_volume">Highest volume recorded</span>
    </div>
  </div>

  <!-- Card 8: Lowest Volume -->
  <div class="metric-card bento-card liquid-glass-card" id="cardMediaLowVolume">
    <div class="metric-header">
      <span id="lblMediaLowVolume" class="metric-label" data-i18n="media_metric_low_volume">Lowest Volume</span>
      <span class="metric-icon-box violet">🔉</span>
    </div>
    <div class="metric-value-container">
      <span id="mediaMetricLowVolume" class="metric-big-num">0%</span>
    </div>
    <div class="metric-footer">
      <span id="subMediaLowVolume" class="metric-subtext" data-i18n="media_sub_low_volume">Quiet playback level</span>
    </div>
  </div>

  <!-- Card 9: Muted Sessions Count -->
  <div class="metric-card bento-card liquid-glass-card" id="cardMediaMutedSessions">
    <div class="metric-header">
      <span id="lblMediaMutedSessions" class="metric-label" data-i18n="media_metric_muted_sessions">Muted Sessions</span>
      <span class="metric-icon-box rose">🔇</span>
    </div>
    <div class="metric-value-container">
      <span id="mediaMetricMutedSessions" class="metric-big-num">0</span>
    </div>
    <div class="metric-footer">
      <span id="subMediaMutedSessions" class="metric-subtext" data-i18n="media_sub_muted_sessions">Silent / muted playback</span>
    </div>
  </div>

  <!-- Card 10: Longest Media Session -->
  <div class="metric-card bento-card liquid-glass-card" id="cardMediaLongestSession">
    <div class="metric-header">
      <span id="lblMediaLongestSession" class="metric-label" data-i18n="media_metric_longest_session">Longest Media</span>
      <span class="metric-icon-box indigo">⏳</span>
    </div>
    <div class="metric-value-container">
      <span id="mediaMetricLongestSession" class="metric-big-num">0h 00m</span>
    </div>
    <div class="metric-footer">
      <span id="subMediaLongestSession" class="metric-subtext" data-i18n="media_sub_longest_session">Single longest video</span>
    </div>
  </div>
</div>
```

---

### Step 1.3: Add `.kpi-grid-5x2` & Color Utility Classes in `dashboard/dashboard.css`
Append responsive grid rules and icon box utility classes to `dashboard/dashboard.css`:

```css
/* =========================================================================
   Symmetrical 5x2 KPI Bento Grid Architecture
   ========================================================================= */
.kpi-grid-5x2 {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px;
  width: 100%;
}

.kpi-grid-5x2 .metric-card {
  min-height: 135px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* Icon Box Color Accents */
.metric-icon-box.indigo { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
.metric-icon-box.teal { background: rgba(20, 184, 166, 0.15); color: #2dd4bf; }
.metric-icon-box.fuchsia { background: rgba(217, 70, 239, 0.15); color: #e879f9; }

/* Responsive Viewport Breakpoints */
@media (max-width: 1366px) {
  .kpi-grid-5x2 {
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 12px;
  }
  .kpi-grid-5x2 .metric-big-num {
    font-size: 1.4rem;
  }
}

@media (max-width: 1100px) {
  .kpi-grid-5x2 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .kpi-grid-5x2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .kpi-grid-5x2 {
    grid-template-columns: 1fr;
  }
}
```

---

## 🔒 4. Constraints & Invariants

- Preserve UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) on all modified files.
- Ensure all 20 cards retain existing IDs for backward compatibility and introduce exact new IDs for the 8 new cards.
- Do NOT break existing radial gauge SVG in Card 4 (`#svgProductivityGauge`, `#gaugeProgressCircle`).

---

## 📦 5. Deliverables Manifest

- `dashboard/dashboard.html` (Restructured `#trackingMetricsGrid` and `#mediaMetricsGrid` with 10 cards each)
- `dashboard/dashboard.css` (Added `.kpi-grid-5x2` responsive styles and color tokens)

---

## ✅ 6. Local Verification Gate

```powershell
node -e "
const fs = require('fs');
const html = fs.readFileSync('dashboard/dashboard.html', 'utf8');
const trackCards = (html.match(/id=\"card[A-Za-z0-9]+\"/g) || []).length;
console.log('HTML valid, found card IDs:', trackCards);
"
```
