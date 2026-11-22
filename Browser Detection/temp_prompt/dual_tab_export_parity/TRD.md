# Technical Requirements Document (TRD): Dual-Tab Export Parity Overhaul

> **Initiative:** Dual-Tab Export Parity Overhaul (Time Tracking + Media Analytics + Chrono Heatmap)  
> **Task ID:** `TASK-DUAL-TAB-EXPORT-PARITY-001`  
> **Lead Department:** Dept 05 Frontend Engineering & Dept 04 Architecture  
> **Governance:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Author:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Autonomy Model:** `STRATEGY_A_AUTONOMOUS` (Score: 1.0)  

---

## 🏛️ 1. System Architecture & Component Mapping

```mermaid
graph TD
    subgraph UI_Runtime ["Dashboard DOM Runtime (dashboard/dashboard.js)"]
        DOM_Track["#paneTracking (10 KPIs, Chrono Heatmap, Domain Table)"]
        DOM_Media["#paneMedia (10 KPIs, Media Deck, History Table)"]
        GetMetrics["getActiveReportMetrics()"]
        ExportHandler["handleExportHtmlDigestClick()"]
        PrintHandler["triggerPrintPdf()"]
        DOM_Track --> GetMetrics
        DOM_Media --> GetMetrics
        GetMetrics --> ExportHandler
        GetMetrics --> PrintHandler
    end

    subgraph Print_Engine ["Browser Print Subsystem (@media print)"]
        CSS_Main["dashboard/dashboard.css"]
        CSS_Modular["dashboard/styles/backup_digest.css"]
        PrintHandler -->|Invokes window.print()| CSS_Main
        CSS_Main -->|Unhides & Formats| DOM_Track
        CSS_Main -->|Unhides & Formats| DOM_Media
    end

    subgraph Standalone_Generator ["Single-File Offline Digest Engine (backup_hub_digest_feature.js)"]
        Extract["extractDigestKpiMetrics() & extractDigestMediaKpiMetrics()"]
        GenHTML["generateExecutiveDigestHtml(data, options)"]
        Part1["Part 1: renderExecutiveMetricsGrid() + renderChronoHeatmapSection() + renderProportionsAndTable()"]
        Part2["Part 2: renderExecutiveMediaMetricsGrid() + renderMediaSection()"]
        ExportHandler -->|Calls downloadStandaloneHtmlDigest()| GenHTML
        GenHTML --> Extract
        Extract --> Part1
        Extract --> Part2
    end

    subgraph QA_Subsystem ["Verification & Testing Battery"]
        TestFile["tests/test_dual_tab_export_parity.js"]
        TestRunner["run_all_tests.js (117 suites)"]
        TestFile --> TestRunner
    end
```

---

## 🔧 2. Subsystem Technical Specifications

### 2.1 Subsystem 1: CSS Print Rules Engine (`dashboard.css` & `backup_digest.css`)

#### Target Files
- `dashboard/dashboard.css` (around line 7520)
- `dashboard/styles/backup_digest.css` (around line 430)

#### Concrete CSS Rules Specification
```css
/* 1. Unhide both Primary Tabs in @media print */
#paneTracking,
#paneMedia {
  display: block !important;
  opacity: 1 !important;
  visibility: visible !important;
  width: 100% !important;
  max-width: 100% !important;
  padding: 0 !important;
  margin: 0 !important;
  box-sizing: border-box !important;
  overflow: visible !important;
}

/* 2. Enforce Page Break between Tab 1 and Tab 2 */
#paneMedia {
  page-break-before: always !important;
  break-before: page !important;
}

/* 3. Keep purely interactive tabs hidden */
#paneSettings,
#paneAutomations,
#paneStudio {
  display: none !important;
}

/* 4. Format 10-KPI Media Grid in Print View (5x2 symmetrical flow) */
#mediaMetricsGrid,
.kpi-grid-5x2 {
  display: grid !important;
  grid-template-columns: repeat(5, 1fr) !important;
  gap: 8px !important;
  margin-bottom: 12px !important;
  width: 100% !important;
  page-break-inside: auto !important;
  break-inside: auto !important;
}

#mediaMetricsGrid .metric-card {
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  padding: 8px 10px !important;
  margin: 0 !important;
  box-sizing: border-box !important;
  page-break-inside: avoid !important;
  break-inside: avoid !important;
}

/* 5. Format Chrono Heatmap in Print View */
#cardChronoHeatmap {
  display: block !important;
  width: 100% !important;
  max-width: 100% !important;
  page-break-inside: avoid !important;
  break-inside: avoid !important;
  margin-bottom: 14px !important;
}

.chrono-heatmap-container,
.chrono-heatmap-wrapper {
  overflow: visible !important;
  width: 100% !important;
}

.chrono-heatmap-grid {
  display: grid !important;
  grid-template-columns: minmax(36px, 48px) repeat(24, minmax(0, 1fr)) !important;
  gap: 2px !important;
  width: 100% !important;
}

/* 6. Suppress Non-Printable Media & Interactive Widgets */
#multiTabMediaDeckContainer,
#heroMediaPlayerCard,
#heroAudioLabStatus,
.heatmap-controls-row,
.heatmap-mode-toggles,
#heatmapWowBadge,
#heatmapCellTooltip,
.media-deck-header,
.media-deck-grid,
.player-hero-header,
.hero-controls-group,
.hero-progress-section,
.hero-volume-section,
.hero-advanced-row,
.audio-lab-widget,
.media-history-search-filter,
#btnScrollTopMediaHistory {
  display: none !important;
  height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
}
```

#### Line Budget Constraint (`backup_digest.css`)
- Current length: 621 lines.
- Limit: 650 lines max.
- Available line budget: 29 lines.
- Strategy: Group selectors (`.metrics-grid, #mediaMetricsGrid`, `#paneTracking, #paneMedia`) and omit verbose repeated blocks to add all required rules within <= 20 net lines.

---

### 2.2 Subsystem 2: Standalone Executive HTML Digest Engine (`backup_hub_digest_feature.js`)

#### 2.2.1 Data Schema: 10 Media KPIs
```typescript
interface MediaKpiMetrics {
  totalWatchTime: string;      // e.g. "2h 45m"
  avgWatchPerVideo: string;    // e.g. "8m 30s"
  totalSessions: string;       // e.g. "14"
  topPlatform: string;         // e.g. "YouTube"
  activeStreams: string;       // e.g. "0"
  avgVolume: string;           // e.g. "72%"
  peakVolume: string;          // e.g. "95%"
  lowestVolume: string;        // e.g. "30%"
  mutedSessions: string;       // e.g. "2"
  longestSession: string;      // e.g. "42m 10s"
}
```

#### 2.2.2 Telemetry Extraction Function: `extractDigestMediaKpiMetrics(rawData, options)`
- Check `options.mediaMetrics` first (passed from dashboard DOM).
- If unavailable, compute dynamically from `rawData.media_history || rawData.mediaHistory || []`:
  - `totalWatchTime`: sum of `item.watchDuration || item.duration || 0` formatted to HH:MM:SS.
  - `totalSessions`: array length.
  - `avgWatchPerVideo`: `totalWatchTime / totalSessions`.
  - `topPlatform`: frequency count on `item.platform || item.domain || 'Other'`.
  - `activeStreams`: count of items with `status === 'playing'` (default "0" for offline history).
  - `avgVolume`: mean of `item.volume || 0`.
  - `peakVolume`: max of `item.volume || 0`.
  - `lowestVolume`: min non-zero of `item.volume || 0`.
  - `mutedSessions`: count of items where `item.muted === true` or `item.volume === 0`.
  - `longestSession`: max of `item.watchDuration || item.duration || 0`.

#### 2.2.3 HTML Template Hierarchy
```javascript
function generateExecutiveDigestHtml(data, options = {}) {
  // 1. Data Normalization
  const norm = normalizeTelemetryDataset(rawData, options);
  const trackingKpis = extractDigestKpiMetrics(rawData, norm, options);
  const mediaKpis = extractDigestMediaKpiMetrics(rawData, options);
  const chronoHeatmapData = options.chronoHeatmap || rawData.hourlyActivity || null;

  // 2. Part 1 Components (Time Tracking & Circadian Focus)
  const trackingGridHtml = renderExecutiveMetricsGrid(trackingKpis);
  const chronoHeatmapHtml = renderChronoHeatmapSection(chronoHeatmapData);
  const domainBreakdownHtml = renderProportionsAndTable(sortedDomains, ...);

  // 3. Part 2 Components (Media Analytics & Audio Telemetry)
  const mediaGridHtml = renderExecutiveMediaMetricsGrid(mediaKpis);
  const mediaTableHtml = renderMediaSection(mediaHistory, totalMediaSeconds);

  // 4. Return Full Document
  return `...`;
}
```

#### 2.2.4 Standalone Chrono Heatmap Renderer: `renderChronoHeatmapSection(data)`
- Renders an inline SVG or CSS grid matrix (7 rows for days Mon-Sun, 24 columns for hours 00-23).
- Uses 5 intensity tiers:
  - Tier 0: `#1e293b` (dark) / `#f1f5f9` (light)
  - Tier 1: `rgba(16, 185, 129, 0.25)` / `#a7f3d0`
  - Tier 2: `rgba(16, 185, 129, 0.50)` / `#6ee7b7`
  - Tier 3: `rgba(16, 185, 129, 0.75)` / `#34d399`
  - Tier 4: `#10b981` / `#059669`
- Includes a compact legend bar (`0m`, `1-15m`, `15-30m`, `30-45m`, `45-60m`).
- Completely self-contained; zero external font or stylesheet dependencies.

#### 2.2.5 Media KPI Grid Renderer: `renderExecutiveMediaMetricsGrid(mediaKpis)`
- Modular sub-functions:
  - `renderMediaGridRow1(kpi)`: Total Watch, Avg Watch, Total Sessions, Top Platform, Live Streams.
  - `renderMediaGridRow2(kpi)`: Avg Volume, Peak Volume, Low Volume, Muted Sessions, Longest Media.
- Strict Rule 28 compliance: each function <= 45 lines, nesting depth <= 3.

---

### 2.3 Subsystem 3: Dashboard Integration (`dashboard.js`)

#### Modifications in `getActiveReportMetrics(options)`
```javascript
// Extract Media KPIs from live DOM with fallback to data
const mediaTotalWatch = readKpiDomText('mediaMetricTotalWatch', '0h 00m');
const mediaAvgWatch = readKpiDomText('mediaMetricAvgWatch', '0m 00s');
const mediaSessionsCount = readKpiDomText('mediaMetricSessionsCount', '0');
const mediaTopPlatform = readKpiDomText('mediaMetricTopPlatform', '--');
const mediaActiveStreams = readKpiDomText('mediaMetricActiveStreams', '0');
const mediaAvgVolume = readKpiDomText('mediaMetricAvgVolume', '0%');
const mediaPeakVolume = readKpiDomText('mediaMetricPeakVolume', '0%');
const mediaLowVolume = readKpiDomText('mediaMetricLowVolume', '0%');
const mediaMutedSessions = readKpiDomText('mediaMetricMutedSessions', '0');
const mediaLongestSession = readKpiDomText('mediaMetricLongestSession', '0h 00m');

// Pack mediaMetrics object
const mediaMetrics = {
  totalWatchTime: mediaTotalWatch,
  avgWatchPerVideo: mediaAvgWatch,
  totalSessions: mediaSessionsCount,
  topPlatform: mediaTopPlatform,
  activeStreams: mediaActiveStreams,
  avgVolume: mediaAvgVolume,
  peakVolume: mediaPeakVolume,
  lowestVolume: mediaLowVolume,
  mutedSessions: mediaMutedSessions,
  longestSession: mediaLongestSession
};
```

#### Modifications in `handleExportHtmlDigestClick(e, menu, trigger)`
```javascript
const activeMetrics = (typeof getActiveReportMetrics === 'function') ? getActiveReportMetrics() : {};
const exportOptions = {
  metrics: activeMetrics,
  mediaMetrics: activeMetrics.mediaMetrics || {},
  chronoHeatmap: (typeof window !== 'undefined' && window.__CHRONO_HEATMAP_DATA__) || null,
  reportingPeriod: activeMetrics.reportingPeriod || 'All Recorded Time',
  productivityIndex: activeMetrics.productivityScore || 85
};
```

---

### 2.4 Subsystem 4: Standalone Automated QA Test Battery (`tests/test_dual_tab_export_parity.js`)

| Battery # | Battery Title | Assertion Contracts |
| :---: | :--- | :--- |
| **1** | CSS Print View Rules Parity | Verify `@media print` unhides `#paneMedia` (`display: block !important;`), formats `#mediaMetricsGrid` to 5-col grid, formats `#cardChronoHeatmap`, and suppresses `#multiTabMediaDeckContainer`, `#heroMediaPlayerCard`, `#heroAudioLabStatus` in both `dashboard.css` and `backup_digest.css`. |
| **2** | Standalone HTML Digest Dual-Tab Structure | Call `generateExecutiveDigestHtml()` and assert presence of Part 1 (Tracking Grid, Chrono Heatmap, Domain Table) and Part 2 (Media Analytics Heading, 10-KPI Media Grid, Media History Table). |
| **3** | Media KPI Extraction & Computation | Pass mock media history and assert `extractDigestMediaKpiMetrics()` computes correct values for all 10 cards with proper labels and units. |
| **4** | Chrono Heatmap SVG/Grid Integrity | Assert generated HTML contains 7 day labels (Mon-Sun), 24 hour columns (00-23), intensity tier classes, and legend bar. |
| **5** | Dashboard Integration Data Binding | Assert `getActiveReportMetrics` returns `mediaMetrics` object and `handleExportHtmlDigestClick` passes `mediaMetrics` and `chronoHeatmap` options. |
| **6** | Universal Rule 28 Compliance & AppSec | Validate `backup_digest.css` length <= 650 lines, all functions in feature file <= 50 lines, nesting depth <= 3, zero direct `innerHTML` usage, and 100% UTF-8 with BOM on all touched files. |

---

## 🔒 3. Non-Functional Requirements & Compliance

1. **Security & Trusted Types:** All strings injected into HTML templates must pass through `escapeHtml()`. Zero direct `innerHTML` assignments in feature scripts.
2. **Deterministic Script Execution:** Test runner executes natively via `node tests/test_dual_tab_export_parity.js` without browser dependencies (using JSDOM mocks or pure string inspection).
3. **Execution Runtime Budget:**
   - Standalone digest generation: < 30ms for 500 domain sessions and 100 media records.
   - Test suite execution: < 600ms total runtime.
4. **Encoding Standard:** All created and modified files MUST adhere to UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
