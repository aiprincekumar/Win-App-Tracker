# Phase 2: Standalone Executive HTML Digest Feature Overhaul

> **Task ID:** `TASK-DUAL-TAB-EXPORT-PARITY-001`  
> **Phase:** 02 of 04  
> **Target Subsystem:** Offline Single-File HTML Digest Generator  
> **Target File:**  
> - [`src/dashboard/features/backup_hub_digest_feature.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/backup_hub_digest_feature.js)  
> **Lead Role:** Level 4 Fullstack Subagent  
> **Status:** `COMPLETED`  

---

## 🎯 1. Phase Objective
Refactor `src/dashboard/features/backup_hub_digest_feature.js` so that `generateExecutiveDigestHtml(data, options)` produces a two-part executive document: Part 1 (10-KPI Tracking Grid, 7x24 Chrono-Activity Heatmap, Domain Breakdown Table) and Part 2 (10-KPI Symmetrical Media Grid, Media Playback History Table) with screen-accurate styles, offline resilience, and zero `innerHTML` violations.

---

## 📋 2. Prerequisites & Inputs
1. Completion of Phase 1 CSS specifications.
2. Target file: [`src/dashboard/features/backup_hub_digest_feature.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/backup_hub_digest_feature.js)
3. Architecture specifications: [`TRD.md`](TRD.md) and [`DESIGN.md`](DESIGN.md)

---

## 🔍 3. Technical Context & File Anchors

### 3.1 `src/dashboard/features/backup_hub_digest_feature.js`
- `renderExecutiveMetricsGrid` (lines 1293-1302): Renders 10 tracking KPIs (2 rows of 5).
- `renderMediaSection` (lines 799-819): Currently only renders a `<table>` with media playback rows if `mediaHistory` is present.
- `extractDigestKpiMetrics` (lines 1230-1280): Normalizes and extracts tracking metrics.
- `generateExecutiveDigestHtml` (lines 1403-1465): Assembles the HTML document; currently lacks Chrono Heatmap and 10-KPI Media Grid.
- `EXECUTIVE_DIGEST_CSS` (lines 824-1150): Embedded CSS string.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1: Implement `extractDigestMediaKpiMetrics(rawData, options)`
1. Check `options.mediaMetrics` first (DOM-scraped values).
2. If absent, calculate from `rawData.media_history || rawData.mediaHistory || []`:
   - `totalWatchTime`: Sum of durations formatted with `formatHoursMinutes` or `formatHHMMSS`.
   - `avgWatchPerVideo`: Computed average duration.
   - `totalSessions`: Array length.
   - `topPlatform`: Most frequent platform or domain.
   - `activeStreams`: "0" (static export).
   - `avgVolume`: Average volume percentage.
   - `peakVolume`: Highest volume recorded.
   - `lowestVolume`: Lowest non-zero volume.
   - `mutedSessions`: Count of muted/0% volume events.
   - `longestSession`: Maximum individual session duration.
3. Keep function <= 45 lines, depth <= 3.

### Step 2: Implement `renderExecutiveMediaMetricsGrid(mediaKpis)`
1. Architect 10-card symmetrical grid (2 rows of 5 cards):
   - `renderMediaGridRow1(kpi)`: Total Watch Time, Avg Watch per Video, Media Sessions, Top Platform, Live Streams.
   - `renderMediaGridRow2(kpi)`: Average Volume, Peak Volume, Lowest Volume, Muted Sessions, Longest Media.
2. Format cards matching `.metric-card` with icons (`🎬`, `⏱️`, `🎞️`, `📺`, `📡`, `🔊`, `⚡`, `🔉`, `🔇`, `⏳`) and subtext.
3. Wrap in `<div class="metrics-grid media-metrics-grid">`.
4. Keep all sub-functions <= 45 lines.

### Step 3: Implement `renderChronoHeatmapSection(heatmapData)`
1. Renders a 7x24 matrix for days (Mon, Tue, Wed, Thu, Fri, Sat, Sun) and hours (00 to 23).
2. If `heatmapData` matrix is provided in options, map hourly intensity tiers (0 to 4).
3. If no explicit matrix exists, derive hourly buckets from `activityData` or render baseline 0-tier matrix with daylight activity distribution.
4. Render 5-tier legend bar (`0m`, `1-15m`, `15-30m`, `30-45m`, `45-60m`).
5. Ensure pure SVG or CSS grid structure with complete offline rendering.
6. Keep function <= 45 lines.

### Step 4: Expand `EXECUTIVE_DIGEST_CSS`
Add the following styles to `EXECUTIVE_DIGEST_CSS`:
```css
/* Media Metrics 10-KPI Grid */
.media-metrics-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-bottom: 24px;
}

/* Standalone Chrono Heatmap */
.chrono-heatmap-section {
  margin-bottom: 24px;
}
.chrono-heatmap-grid {
  display: grid;
  grid-template-columns: 48px repeat(24, 1fr);
  gap: 2px;
  margin-bottom: 8px;
}
.heatmap-cell {
  height: 14px;
  border-radius: 2px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.heatmap-cell.tier-0 { background: #f8fafc; }
.heatmap-cell.tier-1 { background: #d1fae5; }
.heatmap-cell.tier-2 { background: #6ee7b7; }
.heatmap-cell.tier-3 { background: #10b981; }
.heatmap-cell.tier-4 { background: #047857; }

/* Page break before Media Part in Print */
@media print {
  .part-media-section {
    page-break-before: always !important;
    break-before: page !important;
  }
}
```

### Step 5: Update `generateExecutiveDigestHtml`
Assemble the complete two-part document:
```javascript
// Part 1: Tracking & Focus
const trackingGridHtml = renderExecutiveMetricsGrid(trackingKpis);
const chronoHeatmapHtml = renderChronoHeatmapSection(chronoHeatmapData);
const domainBreakdownHtml = renderProportionsAndTable(sortedDomains, ...);

// Part 2: Media Analytics
const mediaGridHtml = renderExecutiveMediaMetricsGrid(mediaKpis);
const mediaTableHtml = renderMediaSection(mediaHistory, totalMediaSeconds);
```
Wrap Part 2 inside `<div class="part-media-section">...</div>`.

---

## 🚫 5. Architectural Constraints & Out-of-Scope Boundaries
- **Universal Rule 28:** Every function MUST be <= 50 lines. Nesting depth MUST be <= 3.
- **W3C Security:** Zero direct `innerHTML`. All string interpolations MUST pass through `escapeHtml()`.
- **Zero External Assets:** No external web fonts, CDNs, or scripts in the standalone template.

---

## 📦 6. Deliverables Manifest
1. `src/dashboard/features/backup_hub_digest_feature.js`: Updated feature script with `extractDigestMediaKpiMetrics`, `renderExecutiveMediaMetricsGrid`, `renderChronoHeatmapSection`, expanded `EXECUTIVE_DIGEST_CSS`, and unified dual-tab `generateExecutiveDigestHtml`.

---

## 🚦 7. Local Verification Gate
```powershell
# 1. Verify code formatting and line length / depth
node -e "
const fs = require('fs');
const content = fs.readFileSync('src/dashboard/features/backup_hub_digest_feature.js', 'utf8');
const fnMatches = content.match(/function\s+([a-zA-Z0-9_]+)\s*\(/g);
console.log('Total functions in feature:', fnMatches ? fnMatches.length : 0);
"

# 2. Run export reports data test suite
node tests/test_export_reports_data_and_layout_fix.js
```
