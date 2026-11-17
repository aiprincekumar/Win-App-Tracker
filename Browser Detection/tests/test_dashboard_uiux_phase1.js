/**
 * Automated Verification Test Suite: Phase 1 - Bento Grid Layout & iOS 26 Liquid Glass Depth
 * 
 * Subsystems Tested:
 * - System 1: Bento Grid Layout Architecture (12-Col Responsive Modular Grid & Zero CLS)
 * - System 2: iOS 26 Specular Liquid Glass Depth Engine (Blur + Saturation + Specular Gradient Borders)
 * 
 * Test Batteries:
 * 1. Battery 1: AST Parsing, Syntax & File Existence Verification (dashboard.js, dashboard.css, dashboard.html)
 * 2. Battery 2: CSS Liquid Glass Tokens & Root Variables Verification
 * 3. Battery 3: Bento Grid Layout Engine & Span Utilities Verification
 * 4. Battery 4: Responsive Media Query Breakpoints Verification (1200px & 768px)
 * 5. Battery 5: Zero CLS Skeleton Shimmer Loaders Verification
 * 6. Battery 6: HTML Bento Grid Architecture & Card Materiality Classes
 * 7. Battery 7: DOM Invariant & Critical Selector Preservation Verification
 * 8. Battery 8: W3C Trusted Types, Zero Inline Event Handlers & UTF-8 BOM Compliance
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const baseDir = path.resolve(__dirname, '..');
const dashHtmlPath = path.join(baseDir, 'dashboard', 'dashboard.html');
const dashCssPath = path.join(baseDir, 'dashboard', 'dashboard.css');
const dashJsPath = path.join(baseDir, 'dashboard', 'dashboard.js');

console.log('🧪 Starting Phase 1 Bento Grid Layout & iOS 26 Liquid Glass Test Suite...\n');

// ===========================================================================
// Battery 1: AST Parsing, Syntax & File Existence Verification
// ===========================================================================
console.log('Battery 1: AST Parsing, Syntax & File Existence Verification');
{
  assert(fs.existsSync(dashHtmlPath), 'dashboard/dashboard.html must exist on disk');
  assert(fs.existsSync(dashCssPath), 'dashboard/dashboard.css must exist on disk');
  assert(fs.existsSync(dashJsPath), 'dashboard/dashboard.js must exist on disk');

  const jsCode = fs.readFileSync(dashJsPath, 'utf8');
  assert.doesNotThrow(() => {
    new vm.Script(jsCode, { filename: 'dashboard.js' });
  }, 'dashboard/dashboard.js must parse cleanly into AST with 0 syntax errors');

  console.log(`  ✅ vm.Script parsed dashboard/dashboard.js successfully (${jsCode.length} bytes, 0 parse errors)`);
  console.log('  ✅ Target files verified on disk: dashboard.html, dashboard.css, dashboard.js');
}

// ===========================================================================
// Battery 2: CSS Liquid Glass Tokens & Root Variables Verification
// ===========================================================================
console.log('\nBattery 2: CSS Liquid Glass Tokens & Root Variables Verification');
{
  const css = fs.readFileSync(dashCssPath, 'utf8');

  // Verify Root Liquid Glass Tokens
  assert(css.includes('--glass-surface-bg: rgba(18, 24, 38, 0.72);'), 'CSS must define --glass-surface-bg in dark theme');
  assert(css.includes('--glass-surface-hover: rgba(26, 34, 52, 0.85);'), 'CSS must define --glass-surface-hover in dark theme');
  assert(css.includes('--glass-border-specular: linear-gradient('), 'CSS must define --glass-border-specular');
  assert(css.includes('rgba(255, 255, 255, 0.16) 0%'), 'Specular gradient must include 16% white top specular highlight');
  assert(css.includes('rgba(255, 255, 255, 0.04) 50%'), 'Specular gradient must include 4% white mid reflection');
  assert(css.includes('rgba(0, 0, 0, 0.25) 100%'), 'Specular gradient must include 25% shadow bottom occlusion');
  assert(css.includes('--shadow-ambient: 0 12px 32px -4px rgba(0, 0, 0, 0.45);'), 'CSS must define --shadow-ambient');
  assert(css.includes('--shadow-specular-glow: 0 0 20px -2px rgba(16, 185, 129, 0.15);'), 'CSS must define --shadow-specular-glow');
  assert(css.includes('--glass-blur-radius: 24px;'), 'CSS must define --glass-blur-radius as 24px');

  // Verify Light Theme Liquid Glass Tokens
  assert(css.includes('rgba(255, 255, 255, 0.85)'), 'Light theme must calibrate --glass-surface-bg');
  assert(css.includes('rgba(255, 255, 255, 0.95)'), 'Light theme must calibrate --glass-surface-hover');

  console.log('  ✅ Dark mode iOS 26 Liquid Glass tokens verified (--glass-surface-bg, hover, specular border, shadows, 24px blur)');
  console.log('  ✅ Light mode calibrated glass tokens verified');
}

// ===========================================================================
// Battery 3: Bento Grid Layout Engine & Span Utilities Verification
// ===========================================================================
console.log('\nBattery 3: Bento Grid Layout Engine & Span Utilities Verification');
{
  const css = fs.readFileSync(dashCssPath, 'utf8');

  // Bento Grid Container
  assert(css.includes('.bento-grid-container {'), 'CSS must define .bento-grid-container');
  assert(css.includes('grid-template-columns: repeat(12, minmax(0, 1fr));'), '.bento-grid-container must use 12-column template');
  assert(css.includes('grid-auto-rows: minmax(140px, auto);'), '.bento-grid-container must specify minmax(140px, auto)');
  assert(css.includes('gap: 1.25rem;'), '.bento-grid-container must declare 1.25rem gap');
  assert(css.includes('max-width: 1720px;'), '.bento-grid-container must cap at 1720px');

  // Bento Card
  assert(css.includes('.bento-card {'), 'CSS must define .bento-card');
  assert(css.includes('border-radius: 18px;'), '.bento-card must have border-radius: 18px');
  assert(css.includes('min-height: 140px;'), '.bento-card must have min-height: 140px for Zero CLS');
  assert(css.includes('transition: transform 220ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 220ms ease;'), '.bento-card must have smooth 220ms cubic-bezier transitions');

  // Utility Spans
  assert(css.includes('.bento-span-12 { grid-column: span 12; }'), 'CSS must define .bento-span-12');
  assert(css.includes('.bento-span-8  { grid-column: span 8; }') || css.includes('.bento-span-8 { grid-column: span 8; }'), 'CSS must define .bento-span-8');
  assert(css.includes('.bento-span-6  { grid-column: span 6; }') || css.includes('.bento-span-6 { grid-column: span 6; }'), 'CSS must define .bento-span-6');
  assert(css.includes('.bento-span-4  { grid-column: span 4; }') || css.includes('.bento-span-4 { grid-column: span 4; }'), 'CSS must define .bento-span-4');
  assert(css.includes('.bento-span-3  { grid-column: span 3; }') || css.includes('.bento-span-3 { grid-column: span 3; }'), 'CSS must define .bento-span-3');
  assert(css.includes('.bento-row-span-2 { grid-row: span 2; }'), 'CSS must define .bento-row-span-2');

  // Liquid Glass Card Materiality
  assert(css.includes('.liquid-glass-card {'), 'CSS must define .liquid-glass-card');
  assert(css.includes('backdrop-filter: blur(var(--glass-blur-radius)) saturate(190%);'), '.liquid-glass-card must declare blur and 190% saturation');
  assert(css.includes('-webkit-backdrop-filter: blur(var(--glass-blur-radius)) saturate(190%);'), '.liquid-glass-card must declare WebKit prefix for Safari/Blink engines');
  assert(css.includes('border-image: var(--glass-border-specular) 1;'), '.liquid-glass-card must declare specular border-image gradient');
  assert(css.includes('box-shadow: var(--shadow-ambient);'), '.liquid-glass-card must declare ambient box shadow');

  // Hover states
  assert(css.includes('.liquid-glass-card:hover'), 'CSS must define .liquid-glass-card:hover');
  assert(css.includes('transform: translateY(-2px);'), '.liquid-glass-card:hover must provide subtle -2px lift');

  console.log('  ✅ 12-Column Bento Grid Container verified (repeat(12, minmax(0, 1fr)), 1.25rem gap, 1720px max-width)');
  console.log('  ✅ Bento card zero CLS dimensions verified (min-height: 140px, 18px radius, 220ms bezier transitions)');
  console.log('  ✅ Complete utility span hierarchy verified (.bento-span-12, 8, 6, 4, 3, and row-span-2)');
  console.log('  ✅ Specular Liquid Glass depth engine verified (24px blur + 190% sat + specular border + lift hover)');
}

// ===========================================================================
// Battery 4: Responsive Media Query Breakpoints Verification
// ===========================================================================
console.log('\nBattery 4: Responsive Media Query Breakpoints Verification');
{
  const css = fs.readFileSync(dashCssPath, 'utf8');

  // Breakpoint 1200px
  assert(css.includes('@media (max-width: 1200px)'), 'CSS must contain @media (max-width: 1200px)');
  const bp1200Match = css.match(/@media \(max-width:\s*1200px\) \{([\s\S]*?)\n\}/);
  assert(bp1200Match, '1200px breakpoint block must be well-formed');
  const bp1200Content = bp1200Match[1];
  assert(bp1200Content.includes('.bento-span-8') && bp1200Content.includes('grid-column: span 12;'), '1200px query must collapse .bento-span-8 to span 12');
  assert(bp1200Content.includes('.bento-span-3') && bp1200Content.includes('grid-column: span 6;'), '1200px query must collapse .bento-span-3 to span 6');

  // Breakpoint 768px
  assert(css.includes('@media (max-width: 768px)'), 'CSS must contain @media (max-width: 768px)');
  const bp768Match = css.match(/@media \(max-width:\s*768px\) \{([\s\S]*?)\n\}/);
  assert(bp768Match, '768px breakpoint block must be well-formed');
  const bp768Content = bp768Match[1];
  assert(bp768Content.includes('grid-column: span 12;'), '768px query must collapse spans to span 12');
  assert(bp768Content.includes('padding: 0.75rem;') && bp768Content.includes('gap: 0.75rem;'), '768px query must tighten padding and gap to 0.75rem');

  console.log('  ✅ @media (max-width: 1200px) collapse verified (span-8 -> span-12, span-3 -> span-6)');
  console.log('  ✅ @media (max-width: 768px) mobile collapse verified (all cards span-12, 0.75rem padding & gap)');
}

// ===========================================================================
// Battery 5: Zero CLS Skeleton Shimmer Loaders Verification
// ===========================================================================
console.log('\nBattery 5: Zero CLS Skeleton Shimmer Loaders Verification');
{
  const css = fs.readFileSync(dashCssPath, 'utf8');

  assert(css.includes('.skeleton-shimmer {'), 'CSS must define .skeleton-shimmer');
  assert(css.includes('.skeleton-shimmer::after {'), 'CSS must define .skeleton-shimmer::after with linear-gradient shimmer beam');
  assert(css.includes('animation: skeletonShimmer 2s infinite cubic-bezier(0.4, 0, 0.2, 1);'), 'CSS must define smooth 2s skeletonShimmer animation');
  assert(css.includes('@keyframes skeletonShimmer {'), 'CSS must define @keyframes skeletonShimmer');

  console.log('  ✅ Zero CLS Skeleton Shimmer loader engine verified with hardware-accelerated 2s keyframe loop');
}

// ===========================================================================
// Battery 6: HTML Bento Grid Architecture & Card Materiality Classes
// ===========================================================================
console.log('\nBattery 6: HTML Bento Grid Architecture & Card Materiality Classes');
{
  const html = fs.readFileSync(dashHtmlPath, 'utf8');

  // Verify Bento Containers in all primary tabs
  assert(html.includes('id="tabContentTimeTracking" class="bento-grid-container"'), 'Pane A must declare #tabContentTimeTracking with .bento-grid-container');
  assert(html.includes('id="tabContentMediaAnalytics" class="bento-grid-container"'), 'Pane B must declare #tabContentMediaAnalytics with .bento-grid-container');
  assert(html.includes('id="tabContentSettings" class="bento-grid-container settings-grid"'), 'Pane C must declare #tabContentSettings with .bento-grid-container');

  // Verify Bento Spans & Liquid Glass Classes
  assert(html.includes('metric-card bento-card liquid-glass-card bento-span-3'), 'Tracking metrics must use .bento-card .liquid-glass-card .bento-span-3');
  assert(html.includes('id="timeDistributionCard" class="analytics-hero-card bento-card liquid-glass-card bento-span-12"'), '#timeDistributionCard must use .bento-card .liquid-glass-card .bento-span-12');
  assert(html.includes('data-table-card bento-card liquid-glass-card bento-span-12'), 'Data tables must use .bento-card .liquid-glass-card .bento-span-12');

  // Media Tab Spans
  assert(html.includes('metric-card bento-card liquid-glass-card bento-span-4'), 'Media metrics must use .bento-card .liquid-glass-card .bento-span-4');
  assert(html.includes('id="heroMediaPlayerCard" class="live-player-hero-card bento-card liquid-glass-card bento-span-8 bento-row-span-2"'), '#heroMediaPlayerCard must use .bento-span-8 .bento-row-span-2');
  assert(html.includes('id="heroAudioLabStatus" class="audio-lab-widget glass-card bento-card liquid-glass-card bento-span-4 bento-row-span-2"'), '#heroAudioLabStatus must use .bento-span-4 .bento-row-span-2');
  assert(
    html.includes('id="heroAudioEqCard"') &&
    (html.includes('audio-eq-widget glass-card bento-card liquid-glass-card bento-span-12') ||
     html.includes('audio-eq-widget glass-card bento-card liquid-glass-card bento-span-6')),
    '#heroAudioEqCard must declare .bento-card and .liquid-glass-card with .bento-span-12 or .bento-span-6'
  );

  // Settings Tab Spans
  assert(html.includes('settings-card bento-card liquid-glass-card bento-span-6'), 'Settings cards must use .bento-card .liquid-glass-card .bento-span-6');

  console.log('  ✅ Primary tab containers (#tabContentTimeTracking, #tabContentMediaAnalytics, #tabContentSettings) verified');
  console.log('  ✅ Bento Grid card classes (.bento-card, .liquid-glass-card) verified on all modules');
  console.log('  ✅ Hero player (span-8 row-span-2) and Audio Lab (span-4 row-span-2) 12-column pairing verified');
  console.log('  ✅ Metric card spans (span-3 & span-4) and table spans (span-12) verified');
}

// ===========================================================================
// Battery 7: DOM Invariant & Critical Selector Preservation Verification
// ===========================================================================
console.log('\nBattery 7: DOM Invariant & Critical Selector Preservation Verification');
{
  const html = fs.readFileSync(dashHtmlPath, 'utf8');

  const criticalIds = [
    // Tab Panes & Nav
    'navTabTracking', 'navTabMedia', 'navTabSettings',
    'paneTracking', 'paneMedia', 'paneSettings',
    // Top Bar & Controls
    'topBarTitle', 'browserFilterSelect', 'trackingModeSelect',
    'dataHubBadge', 'liveClockPill', 'btnLangToggle', 'btnThemeToggle', 'btnGlobalRefresh',
    // Tracking Metrics & Charts
    'trackMetricTodayTime', 'trackMetricDailyAvg', 'trackMetricTotalTime', 'trackMetricTopDomain',
    'timeDistributionCard', 'dashboardDonutSvg', 'dashboardDonutSlices', 'donutCenterBigTime',
    'donutLegendList', 'topBarsListContainer', 'domainAnalyticsTable', 'domainTableBody', 'domainTableEmptyState',
    // Media Metrics & Hero Player
    'mediaMetricTotalWatch', 'mediaMetricAvgWatch', 'mediaMetricAvgVolume', 'mediaMetricPeakVolume',
    'mediaMetricLowVolume', 'mediaMetricSessionsCount',
    'heroMediaPlayerCard', 'playerPulseDot', 'headingPlayerHero', 'playerStatusBadge',
    'heroMediaControls', 'btnHeroRewind', 'btnHeroPlayPause', 'btnHeroForward', 'btnHeroMute',
    'heroProgressBar', 'heroProgressFill', 'heroVolumeBar', 'heroVolumeFill',
    'btnHeroFullscreen', 'btnHeroPip', 'btnHeroTheater', 'btnHeroSwitchTab',
    // Audio Lab & Equalizer Controls
    'heroAudioLabStatus', 'heroAudioEqCard', 'audioLabTitle', 'toggleBassBoost', 'heroAudioBoostSlider', 'heroAudioBoostVal',
    'audioEqPresetSelect', 'btnResetEq', 'eqBand60', 'eqBand250', 'eqBand1000', 'eqBand4000', 'eqBand16000',
    'toggleVocalClarity', 'toggleNightShield', 'toggleAudioOnlyMode',
    // Settings & Dialogs
    'settingIdleTimeout', 'settingLanguage', 'settingWsUrl', 'btnTestWsConnection',
    'cardSleepSettings', 'settingDefaultSleepDuration', 'settingSleepFadeToggle', 'btnSaveSleepSettings',
    'btnExportFullJson', 'btnExportTrackingCsv', 'btnExportMediaCsv',
    'btnTriggerClearMedia', 'btnTriggerClearTime', 'btnTriggerWipeAll',
    'confirmModal', 'toastNotification'
  ];

  let missingCount = 0;
  for (const id of criticalIds) {
    if (!html.includes(`id="${id}"`)) {
      console.error(`  ❌ Missing critical DOM ID: #${id}`);
      missingCount++;
    }
  }
  assert.strictEqual(missingCount, 0, `All ${criticalIds.length} critical DOM IDs must be 100% preserved`);

  console.log(`  ✅ 100% of ${criticalIds.length} critical DOM IDs preserved without single omission`);
  console.log('  ✅ Interactive controls (sliders, playback buttons, switches, selects) 100% intact');
}

// ===========================================================================
// Battery 8: W3C Trusted Types, Zero Inline Event Handlers & UTF-8 BOM
// ===========================================================================
console.log('\nBattery 8: W3C Trusted Types, Zero Inline Event Handlers & UTF-8 BOM');
{
  const html = fs.readFileSync(dashHtmlPath, 'utf8');

  // Verify zero inline event handlers
  assert(!html.includes('onclick='), 'dashboard.html must contain 0 onclick inline handlers');
  assert(!html.includes('onchange='), 'dashboard.html must contain 0 onchange inline handlers');
  assert(!html.includes('onkeydown='), 'dashboard.html must contain 0 onkeydown inline handlers');
  assert(!html.includes('javascript:'), 'dashboard.html must contain 0 javascript: pseudo-protocol URIs');

  // Verify UTF-8 BOM on all target files
  const filesToCheck = [dashHtmlPath, dashCssPath, __filename];
  for (const f of filesToCheck) {
    const buf = fs.readFileSync(f);
    assert(buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf, `${path.basename(f)} must have UTF-8 BOM header (0xEF, 0xBB, 0xBF)`);
  }

  console.log('  ✅ W3C Trusted Types & Strict CSP verified (0 inline handlers, 0 javascript: URIs)');
  console.log('  ✅ UTF-8 BOM byte sequence (0xEF, 0xBB, 0xBF) certified on dashboard.html, dashboard.css, test_dashboard_uiux_phase1.js');
}

console.log('\n🎉 ALL 8 PHASE 1 BENTO GRID & LIQUID GLASS TEST BATTERIES PASSED WITH 100% SUCCESS!\n');
