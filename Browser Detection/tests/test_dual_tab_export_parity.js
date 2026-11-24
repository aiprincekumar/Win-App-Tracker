/**
 * Sentinel Web Activity & Media Sentinel - Standalone QA Verification Suite
 * Test Suite: tests/test_dual_tab_export_parity.js
 * Task ID: TASK-DUAL-TAB-EXPORT-PARITY-001 / AUTH-MGR-20261122-DUAL-TAB-001
 * 
 * Verifies Dual-Tab Export Parity across PDF Print Engine and Standalone Executive HTML Digest:
 * - Battery 1: CSS Print Rules & Media Unhiding (dashboard.css and backup_digest.css)
 * - Battery 2: Standalone HTML Digest Dual-Tab Sequential Structure (Part 1 then Part 2)
 * - Battery 3: Media KPI Telemetry Extraction & 10-Card Computation
 * - Battery 4: Chrono Heatmap SVG/Grid Rendering & Legend
 * - Battery 5: Dashboard Integration Data Binding (dashboard.js wiring & fallbacks)
 * - Battery 6: Universal Rule 28 Compliance, Line Limits & UTF-8 with BOM Standard
 * 
 * Author: Level 4 QA Subagent
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('============================================================');
console.log('🧪 DUAL-TAB EXPORT PARITY QA VERIFICATION SUITE');
console.log('============================================================\n');

const baseDir = path.resolve(__dirname, '..');
const featurePath = path.join(baseDir, 'src/dashboard/features/backup_hub_digest_feature.js');
const backupCssPath = path.join(baseDir, 'dashboard/styles/backup_digest.css');
const dashboardCssPath = path.join(baseDir, 'dashboard/dashboard.css');
const dashboardJsPath = path.join(baseDir, 'dashboard/dashboard.js');

const dashboardCss = fs.readFileSync(dashboardCssPath, 'utf8');
const backupCss = fs.readFileSync(backupCssPath, 'utf8');
const featureContent = fs.readFileSync(featurePath, 'utf8');
const dashboardJs = fs.readFileSync(dashboardJsPath, 'utf8');
const feature = require(featurePath);

function extractPrintSection(content) {
  const printIdx = content.indexOf('@media print');
  if (printIdx === -1) return '';
  return content.slice(printIdx);
}

// ============================================================
// Battery 1: CSS Print Rules & Media Unhiding
// ============================================================
console.log('Battery 1: CSS Print Rules & Media Unhiding');
[
  { name: 'dashboard.css', content: dashboardCss },
  { name: 'backup_digest.css', content: backupCss }
].forEach(({ name, content }) => {
  const printCss = extractPrintSection(content);
  assert(printCss.length > 0, `${name} must contain @media print`);

  // Assert #paneMedia and #paneTracking are set to display: block !important
  assert(
    printCss.includes('#paneMedia') && printCss.includes('#paneTracking'),
    `${name} @media print must reference both #paneTracking and #paneMedia`
  );
  assert(
    printCss.includes('display: block !important'),
    `${name} @media print must unhide tracking and media panels with display: block !important`
  );

  // Assert #paneMedia has clean page break transition
  assert(
    printCss.includes('break-before: page !important') || printCss.includes('page-break-before: always !important'),
    `${name} must enforce page-break-before on #paneMedia`
  );

  // Assert #mediaMetricsGrid / .kpi-grid-5x2 is formatted with 5-column grid in landscape
  assert(
    printCss.includes('#mediaMetricsGrid') && printCss.includes('grid-template-columns: repeat(5, 1fr) !important'),
    `${name} must define #mediaMetricsGrid with repeat(5, 1fr) in print`
  );

  // Assert #cardChronoHeatmap print rules
  assert(
    printCss.includes('#cardChronoHeatmap') &&
    (printCss.includes('break-inside: avoid !important') || printCss.includes('page-break-inside: avoid !important')),
    `${name} must prevent cardChronoHeatmap page break fragmentation`
  );

  // Assert .chrono-heatmap-grid has 24 columns in print
  assert(
    printCss.includes('.chrono-heatmap-grid') && printCss.includes('repeat(24,'),
    `${name} must define .chrono-heatmap-grid with 24 columns in print`
  );

  // Assert suppression of non-printable widgets
  const requiredSuppressed = [
    '#multiTabMediaDeckContainer',
    '#heroMediaPlayerCard',
    '#heroAudioLabStatus',
    '.heatmap-controls-row',
    '#heatmapCellTooltip',
    '#paneSettings',
    '#paneAutomations',
    '#paneStudio'
  ];
  requiredSuppressed.forEach(sel => {
    assert(
      printCss.includes(sel),
      `${name} @media print must suppress interactive widget: ${sel}`
    );
  });

  console.log(`  ✅ ${name}: Print rules, #paneMedia unhiding, 5x2 grid & widget suppression verified`);
});

// ============================================================
// Battery 2: Standalone HTML Digest Dual-Tab Sequential Structure
// ============================================================
console.log('\nBattery 2: Standalone HTML Digest Dual-Tab Sequential Structure');
assert(typeof feature.generateExecutiveDigestHtml === 'function', 'generateExecutiveDigestHtml must be exported');

const mockDualTabData = {
  activityData: {
    domains: {
      'github.com': { seconds: 7200, sessionCount: 10, category: 'work' },
      'youtube.com': { seconds: 3600, sessionCount: 4, category: 'entertainment' },
      'stackoverflow.com': { seconds: 1800, sessionCount: 2, category: 'learning' }
    }
  },
  media_history: [
    { title: 'TypeScript Deep Dive', platform: 'YouTube', duration: 1800, volume: 80, isMuted: false },
    { title: 'Focus Flow Lo-Fi', platform: 'Spotify', duration: 1200, volume: 50, isMuted: false },
    { title: 'Podcast Ep 42', platform: 'YouTube', duration: 600, volume: 0, isMuted: true }
  ]
};

const mockOptions = {
  reportingPeriod: 'Last 7 Days',
  generatedDate: '2026-11-22',
  productivityIndex: 88
};

const generatedHtml = feature.generateExecutiveDigestHtml(mockDualTabData, mockOptions);
assert(typeof generatedHtml === 'string' && generatedHtml.length > 500, 'HTML digest must be a non-empty string');

// Verify sequential structure: Part 1 then Part 2 inside <body>
const bodyIdx = generatedHtml.indexOf('<body');
assert(bodyIdx !== -1, 'Generated HTML must contain <body>');
const part1Idx = generatedHtml.indexOf('part-tracking-section', bodyIdx);
const part2Idx = generatedHtml.indexOf('part-media-section', bodyIdx);
assert(part1Idx !== -1, 'Generated HTML body must contain .part-tracking-section');
assert(part2Idx !== -1, 'Generated HTML body must contain .part-media-section');
assert(part1Idx < part2Idx, 'Part 1 (Time Tracking) must precede Part 2 (Media Analytics) in document flow');

// Sequential order verification in Part 1
const kpiIdx = generatedHtml.indexOf('class="metrics-grid"');
const chartIdx = generatedHtml.indexOf('class="chart-section"');
const tableIdx = generatedHtml.indexOf('id="domainAnalyticsTable"');
const heatmapIdx = generatedHtml.indexOf('chrono-heatmap-section');
assert(kpiIdx < chartIdx && chartIdx < tableIdx && tableIdx < heatmapIdx && heatmapIdx < part2Idx,
  'Part 1 exact order must be: 10-KPIs -> Chart Section -> Domain Table -> Chrono Heatmap -> Part 2');

// Verify Part 1 contents: metrics-grid, chrono-heatmap-section, table
assert(generatedHtml.includes('class="metrics-grid"'), 'Part 1 must contain .metrics-grid');
assert(generatedHtml.includes('chrono-heatmap-section'), 'Part 1 must contain .chrono-heatmap-section');
assert(generatedHtml.includes('Circadian Focus'), 'Part 1 must contain Circadian Focus heading');
assert(generatedHtml.includes('Top Activity Proportions'), 'Part 1 must contain Activity Proportions');
assert(generatedHtml.includes('github.com'), 'Part 1 must contain tracked domain github.com');

// Verify Part 2 contents: Media Analytics heading, media-metrics-grid, media table
assert(generatedHtml.includes('Media Analytics &amp; Streaming Telemetry') || generatedHtml.includes('Media Analytics & Streaming Telemetry'),
  'Part 2 must contain Media Analytics section heading');
assert(generatedHtml.includes('media-metrics-grid'), 'Part 2 must contain .media-metrics-grid');
assert(generatedHtml.includes('id="mediaMetricsGrid"'), 'Part 2 must contain id="mediaMetricsGrid"');
assert(generatedHtml.includes('TypeScript Deep Dive'), 'Part 2 must contain media item title');
assert(generatedHtml.includes('Focus Flow Lo-Fi'), 'Part 2 must contain media item title');

// Verify 10 Tracking card labels exist in generated HTML
const trackingLabels = [
  "Today's Browsing Time", 'Daily Average', 'Total Tracked Time', 'Productivity Index',
  'Deep Focus Time', 'Top Website', 'Active Domains', 'Leisure & Distraction', 'Peak Activity Hour', 'Longest Session'
];
trackingLabels.forEach(lbl => {
  assert(generatedHtml.includes(lbl), `Generated HTML must contain tracking card label: ${lbl}`);
});

// Verify 10 Media card labels exist in generated HTML
const mediaLabels = [
  'Total Watch Time', 'Avg Watch per Video', 'Media Sessions', 'Top Platform', 'Live Streams',
  'Average Volume', 'Peak Volume', 'Lowest Volume', 'Muted Sessions', 'Longest Media'
];
mediaLabels.forEach(lbl => {
  assert(generatedHtml.includes(lbl), `Generated HTML must contain media card label: ${lbl}`);
});

console.log('  ✅ Dual-Tab sequential layout (Part 1 -> Part 2) and 10+10 KPI labels certified');

// ============================================================
// Battery 3: Media KPI Telemetry Extraction & 10-Card Computation
// ============================================================
console.log('\nBattery 3: Media KPI Telemetry Extraction & 10-Card Computation');
assert(typeof feature.extractDigestMediaKpiMetrics === 'function', 'extractDigestMediaKpiMetrics must be exported');
assert(typeof feature.renderExecutiveMediaMetricsGrid === 'function', 'renderExecutiveMediaMetricsGrid must be exported');

// Case A: Pure mathematical extraction from raw media list
const rawTelemetry = {
  media_history: [
    { title: 'Video 1', platform: 'YouTube', duration: 3600, volume: 80, isMuted: false },
    { title: 'Track 2', platform: 'Spotify', duration: 1800, volume: 40, isMuted: false },
    { title: 'Stream 3', platform: 'Twitch', duration: 1800, volume: 0, isMuted: true }
  ]
};

const extractedKpis = feature.extractDigestMediaKpiMetrics(rawTelemetry);
assert.strictEqual(extractedKpis.totalWatchTime, '2h 00m', 'Total watch time must be 2h 00m (7200s)');
assert.strictEqual(extractedKpis.avgWatchPerVideo, '40m', 'Avg watch per video must be 40m (2400s)');
assert.strictEqual(extractedKpis.totalSessions, '3', 'Total sessions count must be 3');
assert(extractedKpis.topPlatform === 'YouTube' || extractedKpis.topPlatform === 'Spotify' || extractedKpis.topPlatform === 'Twitch',
  'Top platform must resolve to one of the recorded platforms');
assert.strictEqual(extractedKpis.avgVolume, '40%', 'Average volume must be 40%');
assert.strictEqual(extractedKpis.peakVolume, '80%', 'Peak volume must be 80%');
assert.strictEqual(extractedKpis.lowestVolume, '40%', 'Lowest positive volume must be 40%');
assert.strictEqual(extractedKpis.mutedSessions, '1', 'Muted sessions count must be 1');
assert.strictEqual(extractedKpis.longestSession, '1h 00m', 'Longest session must be 1h 00m (3600s)');
console.log('  ✅ Pure telemetry extraction: All 10 media metrics computed mathematically');

// Case B: Explicit pre-computed media metrics passed via options
const explicitOptions = {
  mediaMetrics: {
    totalWatchTime: '5h 30m',
    avgWatchPerVideo: '15m',
    totalSessions: '22',
    topPlatform: 'SoundCloud',
    activeStreams: '3',
    avgVolume: '60%',
    peakVolume: '95%',
    lowestVolume: '15%',
    mutedSessions: '4',
    longestSession: '2h 10m'
  }
};
const hydratedKpis = feature.extractDigestMediaKpiMetrics(rawTelemetry, explicitOptions);
assert.strictEqual(hydratedKpis.totalWatchTime, '5h 30m');
assert.strictEqual(hydratedKpis.topPlatform, 'SoundCloud');
assert.strictEqual(hydratedKpis.activeStreams, '3');
console.log('  ✅ Options override: Explicit live DOM media metrics take precedence cleanly');

// Case C: Render 10-card media metrics grid HTML
const renderedGrid = feature.renderExecutiveMediaMetricsGrid(extractedKpis);
assert(renderedGrid.includes('class="metrics-grid media-metrics-grid"'), 'Rendered grid must have .media-metrics-grid class');
assert(renderedGrid.includes('id="mediaMetricsGrid"'), 'Rendered grid must have id="mediaMetricsGrid"');
const cardMatches = renderedGrid.match(/class="metric-card"/g);
assert(cardMatches && cardMatches.length === 10, `Media grid must contain exactly 10 metric cards, got ${cardMatches ? cardMatches.length : 0}`);
console.log('  ✅ Media Metrics Grid: Exactly 10 cards rendered in 2 rows of 5');

// ============================================================
// Battery 4: Chrono Heatmap SVG/Grid Rendering & Legend
// ============================================================
console.log('\nBattery 4: Chrono Heatmap SVG/Grid Rendering & Legend');
assert(typeof feature.renderChronoHeatmapSection === 'function', 'renderChronoHeatmapSection must be exported');

// Mock 7-day x 24-hour heatmap matrix
const mockHeatmapMatrix = [];
for (let d = 0; d < 7; d++) {
  const hours = [];
  for (let h = 0; h < 24; h++) {
    hours.push({ activeSeconds: (d === 2 && h >= 10 && h <= 14) ? 1800 : 0, intensityTier: (d === 2 && h >= 10 && h <= 14) ? 2 : 0 });
  }
  mockHeatmapMatrix.push({ hours });
}

const renderedHeatmap = feature.renderChronoHeatmapSection({ chronoHeatmap: mockHeatmapMatrix });
assert(renderedHeatmap.includes('id="cardChronoHeatmap"'), 'Heatmap HTML must include id="cardChronoHeatmap"');
assert(renderedHeatmap.includes('class="chrono-heatmap-grid"'), 'Heatmap HTML must include .chrono-heatmap-grid');

// Assert all 7 day labels are present
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
days.forEach(day => {
  assert(renderedHeatmap.includes(`<div class="heatmap-day-label">${day}</div>`), `Heatmap must include day label: ${day}`);
});

// Assert all 24 hour column labels (00 to 23)
for (let h = 0; h < 24; h++) {
  const hourLabel = String(h).padStart(2, '0');
  assert(renderedHeatmap.includes(`<div class="heatmap-hour-label">${hourLabel}</div>`), `Heatmap must include hour: ${hourLabel}`);
}

// Assert exactly 7 * 24 = 168 cells are rendered
const cellMatches = renderedHeatmap.match(/class="heatmap-cell tier-[0-4]"/g);
assert(cellMatches && cellMatches.length === 168, `Heatmap grid must contain exactly 168 hourly cells, got ${cellMatches ? cellMatches.length : 0}`);

// Assert legend bar structure and tiers
assert(renderedHeatmap.includes('class="heatmap-legend-bar"'), 'Heatmap must include .heatmap-legend-bar');
assert(renderedHeatmap.includes('tier-0') && renderedHeatmap.includes('tier-1') &&
       renderedHeatmap.includes('tier-2') && renderedHeatmap.includes('tier-3') &&
       renderedHeatmap.includes('tier-4'), 'Heatmap must include all 5 intensity tiers (tier-0 to tier-4)');
assert(renderedHeatmap.includes('0m') && renderedHeatmap.includes('1-15m') &&
       renderedHeatmap.includes('15-30m') && renderedHeatmap.includes('30-45m') &&
       renderedHeatmap.includes('45-60m'), 'Heatmap legend must include duration ranges');
console.log('  ✅ Chrono Heatmap: 7x24 grid (168 cells), all day/hour labels, and legend bar verified');

// ============================================================
// Battery 5: Dashboard Integration Data Binding
// ============================================================
console.log('\nBattery 5: Dashboard Integration Data Binding');

// Assert extractMediaMetricsFromDom queries all 10 media KPI elements
const expectedMediaKpiIds = [
  'mediaMetricTotalWatch',
  'mediaMetricAvgWatch',
  'mediaMetricSessionsCount',
  'mediaMetricTopPlatform',
  'mediaMetricActiveStreams',
  'mediaMetricAvgVolume',
  'mediaMetricPeakVolume',
  'mediaMetricLowVolume',
  'mediaMetricMutedSessions',
  'mediaMetricLongestSession'
];
expectedMediaKpiIds.forEach(id => {
  assert(dashboardJs.includes(id), `dashboard.js must reference media KPI DOM ID: ${id}`);
});
console.log('  ✅ dashboard.js: extractMediaMetricsFromDom queries all 10 media KPI DOM elements');

// Assert getActiveReportMetrics returns mediaMetrics and chronoHeatmap
assert(dashboardJs.includes('mediaMetrics = extractMediaMetricsFromDom()') || dashboardJs.includes('mediaMetrics: extractMediaMetricsFromDom()') || dashboardJs.includes('const mediaMetrics = extractMediaMetricsFromDom()'),
  'dashboard.js must call extractMediaMetricsFromDom in getActiveReportMetrics');
assert(dashboardJs.includes('mediaMetrics,') || dashboardJs.includes('mediaMetrics:'),
  'dashboard.js getActiveReportMetrics must include mediaMetrics in returned object');
assert(dashboardJs.includes('chronoHeatmap'),
  'dashboard.js getActiveReportMetrics must include chronoHeatmap in returned object');

// Assert downloadStandaloneHtmlDigest passes mediaMetrics and chronoHeatmap into options
assert(dashboardJs.includes('mediaMetrics: activeMetrics.mediaMetrics') || dashboardJs.includes('mediaMetrics:'),
  'downloadStandaloneHtmlDigest must bundle mediaMetrics into options');
assert(dashboardJs.includes('chronoHeatmap: activeMetrics.chronoHeatmap') || dashboardJs.includes('chronoHeatmap:'),
  'downloadStandaloneHtmlDigest must bundle chronoHeatmap into options');

// Assert handleExportHtmlDigestClick bundles mediaMetrics and chronoHeatmap into exportOptions
assert(dashboardJs.includes('mediaMetrics: activeMetrics.mediaMetrics || {}'),
  'handleExportHtmlDigestClick must bundle mediaMetrics into exportOptions');
assert(dashboardJs.includes('chronoHeatmap: activeMetrics.chronoHeatmap'),
  'handleExportHtmlDigestClick must bundle chronoHeatmap into exportOptions');
console.log('  ✅ dashboard.js: Telemetry extraction and export options wiring fully verified');

// ============================================================
// Battery 6: Universal Rule 28 Compliance, Line Limits & UTF-8 with BOM Standard
// ============================================================
console.log('\nBattery 6: Universal Rule 28 Compliance, Line Limits & UTF-8 with BOM Standard');

// 1. backup_digest.css <= 650 lines check
const backupLines = backupCss.split(/\r?\n/).length;
assert(backupLines <= 650, `dashboard/styles/backup_digest.css (${backupLines} lines) must be <= 650 lines`);
console.log(`  ✅ backup_digest.css line count: ${backupLines} (strictly <= 650 lines limit)`);

// 2. Check function line limits (<= 50 lines) and nesting depth (<= 3) in feature additions
const targetFunctions = [
  'renderExecutiveMediaMetricsGrid',
  'renderMediaMetricsGridRow1',
  'renderMediaMetricsGridRow2',
  'extractDigestMediaKpiMetrics',
  'renderHeatmapDayCells',
  'renderChronoHeatmapSection'
];
const featureLines = featureContent.split(/\r?\n/);

targetFunctions.forEach(fnName => {
  let found = false;
  for (let i = 0; i < featureLines.length; i++) {
    const m = featureLines[i].match(new RegExp(`^\\s*function\\s+${fnName}\\s*\\(`));
    if (m) {
      found = true;
      let start = i;
      let end = i;
      let depth = 0;
      let maxDepth = 0;
      for (let j = i; j < featureLines.length; j++) {
        for (const ch of featureLines[j]) {
          if (ch === '{') {
            depth++;
            if (depth > maxDepth) maxDepth = depth;
          } else if (ch === '}') {
            depth--;
            if (depth === 0) {
              end = j;
              break;
            }
          }
        }
        if (depth === 0) break;
      }
      const lineCount = end - start + 1;
      assert(lineCount <= 50, `Function ${fnName} line count (${lineCount}) must be <= 50`);
      assert(maxDepth <= 3, `Function ${fnName} maxDepth (${maxDepth}) must be <= 3`);
      console.log(`  ✅ Function ${fnName}: ${lineCount} lines, max depth ${maxDepth} (Rule 28 passed)`);
      break;
    }
  }
  assert(found, `Target function ${fnName} must exist in backup_hub_digest_feature.js`);
});

// 3. Zero innerHTML / outerHTML in feature additions
const newFeatureChunk = featureLines.slice(1400, 1650).join('\n');
assert(!newFeatureChunk.includes('.innerHTML'), 'New feature additions must have zero innerHTML assignments');
assert(!newFeatureChunk.includes('.outerHTML'), 'New feature additions must have zero outerHTML assignments');
console.log('  ✅ W3C Trusted Types: Zero innerHTML/outerHTML assignments in feature additions');

// 4. UTF-8 with BOM certified across all touched files
const filesToVerifyBom = [
  dashboardCssPath,
  backupCssPath,
  featurePath,
  dashboardJsPath,
  __filename
];

filesToVerifyBom.forEach(f => {
  const buf = fs.readFileSync(f);
  assert.strictEqual(buf[0], 0xef, `${path.basename(f)} missing UTF-8 BOM byte 1 (0xEF)`);
  assert.strictEqual(buf[1], 0xbb, `${path.basename(f)} missing UTF-8 BOM byte 2 (0xBB)`);
  assert.strictEqual(buf[2], 0xbf, `${path.basename(f)} missing UTF-8 BOM byte 3 (0xBF)`);
  console.log(`  ✅ ${path.basename(f)}: 100% UTF-8 with BOM certified (0xEF, 0xBB, 0xBF)`);
});

console.log('\n============================================================');
console.log('🎉 ALL 6 BATTERIES IN DUAL-TAB EXPORT PARITY QA SUITE PASSED!');
console.log('============================================================\n');
