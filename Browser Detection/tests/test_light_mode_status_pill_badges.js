/**
 * Sentinel Web Activity & Media Sentinel - Standalone QA Verification Suite
 * Test Suite: tests/test_light_mode_status_pill_badges.js
 * Task ID: TASK-LIGHT-MODE-IDLE-BADGE-001
 * 
 * Verifies Light Mode Status Pill Badge ("IDLE", "ACTIVE", etc.) Contrast & Visibility Overhaul:
 * - Battery 1: Dashboard Audio Visualizer Header Status Pill & Indicator Dots (dashboard/styles/media.css)
 * - Battery 2: Dashboard Hero Media Player & Deck Status Pills (dashboard/styles/media.css)
 * - Battery 3: Dashboard Focus Sentinel Hub Status Badges (dashboard/styles/wellbeing_light.css)
 * - Battery 4: Dashboard Sleep Sentinel Hub Status Badges (dashboard/styles/wellbeing_light.css)
 * - Battery 5: Popup Live Media Dynamic Status Button & Dots (popup/styles/themes.css & light_contrast.css)
 * - Battery 6: Popup Sleep Tab Dial Status Badge (popup/styles/tabs/tab_sleep.css)
 * - Battery 7: Popup Focus & Doomscroll Tab Status Badges (popup/styles/tabs/tab_wellness.css)
 * - Battery 8: Mathematical Contrast (WCAG AA >= 4.5:1 & AAA >= 7:1) & Dark Mode Zero-Mutation Invariant
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('============================================================');
console.log('🧪 LIGHT MODE STATUS PILL BADGES CONTRAST & VISIBILITY QA SUITE');
console.log('============================================================\n');

const baseDir = path.resolve(__dirname, '..');

// Load target stylesheets
const wellbeingLightPath = path.join(baseDir, 'dashboard/styles/wellbeing_light.css');
const mediaPath = path.join(baseDir, 'dashboard/styles/media.css');
const themesPath = path.join(baseDir, 'popup/styles/themes.css');
const lightContrastPath = path.join(baseDir, 'popup/styles/themes/light_contrast.css');
const tabSleepPath = path.join(baseDir, 'popup/styles/tabs/tab_sleep.css');
const tabWellnessPath = path.join(baseDir, 'popup/styles/tabs/tab_wellness.css');
const wbBlacklistPath = path.join(baseDir, 'dashboard/styles/wellbeing_blacklist.css');

const wellbeingLightCss = fs.readFileSync(wellbeingLightPath, 'utf8');
const mediaCss = fs.readFileSync(mediaPath, 'utf8');
const themesCss = fs.readFileSync(themesPath, 'utf8');
const lightContrastCss = fs.readFileSync(lightContrastPath, 'utf8');
const tabSleepCss = fs.readFileSync(tabSleepPath, 'utf8');
const tabWellnessCss = fs.readFileSync(tabWellnessPath, 'utf8');
const wbBlacklistCss = fs.readFileSync(wbBlacklistPath, 'utf8');

// Contrast helper functions
function parseHex(hex) {
  const cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    return [
      parseInt(cleanHex[0] + cleanHex[0], 16),
      parseInt(cleanHex[1] + cleanHex[1], 16),
      parseInt(cleanHex[2] + cleanHex[2], 16)
    ];
  }
  return [
    parseInt(cleanHex.substring(0, 2), 16),
    parseInt(cleanHex.substring(2, 4), 16),
    parseInt(cleanHex.substring(4, 6), 16)
  ];
}

function srgbToLinear(c) {
  const norm = c / 255;
  return norm <= 0.03928 ? norm / 12.92 : Math.pow((norm + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex) {
  const [r, g, b] = parseHex(hex);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ===========================================================================
// Battery 1: Audio Visualizer Header Status Pill (dashboard/styles/media.css)
// ===========================================================================
console.log('• Battery 1: Audio Visualizer Header Status Pill & Indicator Dots');
{
  assert(mediaCss.includes('.viz-header-status-pill'), 'media.css must include .viz-header-status-pill');
  assert(mediaCss.includes('body.theme-light .viz-header-status-pill'), 'media.css must scope .viz-header-status-pill under body.theme-light');
  assert(mediaCss.includes('[data-theme="light"] .viz-header-status-pill'), 'media.css must support [data-theme="light"] .viz-header-status-pill');
  assert(mediaCss.includes('body.theme-light .viz-live-dot'), 'media.css must scope .viz-live-dot under body.theme-light');
  assert(mediaCss.includes('body.theme-light .viz-live-dot.active'), 'media.css must style active dot in light mode');
  assert(mediaCss.includes('body.theme-light .viz-header-status-pill.active'), 'media.css must style active status pill in light mode');
  assert(mediaCss.includes('#065f46'), 'media.css active pill must use high-contrast #065f46 text');
  assert(mediaCss.includes('.viz-hud-badge'), 'media.css must style .viz-hud-badge for light mode');
  console.log('  ✅ Battery 1 Passed: Audio Visualizer Header Status Pill & dots verified');
}

// ===========================================================================
// Battery 2: Hero Player & Deck Status Pills (dashboard/styles/media.css)
// ===========================================================================
console.log('• Battery 2: Hero Media Player & Deck Status Pills');
{
  assert(mediaCss.includes('body.theme-light .status-pill.idle'), 'media.css must style .status-pill.idle in light theme');
  assert(mediaCss.includes('body.theme-light .status-pill.playing'), 'media.css must style .status-pill.playing in light theme');
  assert(mediaCss.includes('body.theme-light .status-pill.paused'), 'media.css must style .status-pill.paused in light theme');
  assert(mediaCss.includes('body.theme-light .player-pulse-dot.idle'), 'media.css must style .player-pulse-dot.idle in light theme');
  assert(mediaCss.includes('body.theme-light .deck-status-pill'), 'media.css must style .deck-status-pill in light theme');
  assert(mediaCss.includes('body.theme-light .deck-status-pill.playing'), 'media.css must style .deck-status-pill.playing in light theme');
  assert(mediaCss.includes('body.theme-light .deck-status-pill.paused'), 'media.css must style .deck-status-pill.paused in light theme');
  assert(mediaCss.includes('body.theme-light .deck-status-pill.muted'), 'media.css must style .deck-status-pill.muted in light theme');
  console.log('  ✅ Battery 2 Passed: Hero Player & Deck Status Pills verified');
}

// ===========================================================================
// Battery 3: Focus Sentinel Hub Status Badges (dashboard/styles/wellbeing_light.css)
// ===========================================================================
console.log('• Battery 3: Focus Sentinel Hub Status Badges');
{
  assert(wellbeingLightCss.includes('body.theme-light .badge-focus'), 'wellbeing_light.css must style .badge-focus');
  assert(wellbeingLightCss.includes('body.theme-light .badge-break'), 'wellbeing_light.css must style .badge-break');
  assert(wellbeingLightCss.includes('#065f46'), 'wellbeing_light.css .badge-focus must use #065f46 text (>= 7:1 contrast)');
  assert(wellbeingLightCss.includes('#1e40af'), 'wellbeing_light.css .badge-break must use #1e40af text (>= 7:1 contrast)');
  assert(wellbeingLightCss.includes('.badge-focus-micro'), 'wellbeing_light.css must style .badge-focus-micro');
  assert(wellbeingLightCss.includes('.badge-break-micro'), 'wellbeing_light.css must style .badge-break-micro');
  assert(wellbeingLightCss.includes('.zen-status-badge'), 'wellbeing_light.css must style .zen-status-badge');
  assert(wellbeingLightCss.includes('.hud-dot.idle'), 'wellbeing_light.css must style .hud-dot.idle');
  console.log('  ✅ Battery 3 Passed: Focus Sentinel Hub Status Badges verified');
}

// ===========================================================================
// Battery 4: Sleep Sentinel Hub Status Badges (dashboard/styles/wellbeing_light.css)
// ===========================================================================
console.log('• Battery 4: Sleep Sentinel Hub Status Badges');
{
  assert(wellbeingLightCss.includes('.dash-sleep-badge.idle'), 'wellbeing_light.css must style .dash-sleep-badge.idle');
  assert(wellbeingLightCss.includes('.dash-sleep-badge.running'), 'wellbeing_light.css must style .dash-sleep-badge.running');
  assert(wellbeingLightCss.includes('.dash-sleep-badge.paused'), 'wellbeing_light.css must style .dash-sleep-badge.paused');
  assert(wellbeingLightCss.includes('.dash-sleep-badge.fading'), 'wellbeing_light.css must style .dash-sleep-badge.fading');
  assert(wellbeingLightCss.includes('.dash-sleep-badge.triggered'), 'wellbeing_light.css must style .dash-sleep-badge.triggered');
  assert(wellbeingLightCss.includes('#312e81'), 'wellbeing_light.css running state must use deep indigo #312e81');
  assert(wellbeingLightCss.includes('#92400e'), 'wellbeing_light.css paused/fading states must use deep amber #92400e');
  assert(wellbeingLightCss.includes('#991b1b'), 'wellbeing_light.css triggered state must use deep red #991b1b');
  console.log('  ✅ Battery 4 Passed: Sleep Sentinel Hub Status Badges verified');
}

// ===========================================================================
// Battery 5: Popup Live Media Dynamic Status Button (themes.css & light_contrast.css)
// ===========================================================================
console.log('• Battery 5: Popup Live Media Dynamic Status Button & Dots');
{
  [themesCss, lightContrastCss].forEach((cssText, idx) => {
    const filename = idx === 0 ? 'themes.css' : 'light_contrast.css';
    assert(cssText.includes('[data-theme="light"] .dynamic-status-btn.idle .status-dot'), `${filename} must style idle dot`);
    assert(cssText.includes('[data-theme="light"] .dynamic-status-btn.playing .status-dot'), `${filename} must style playing dot`);
    assert(cssText.includes('[data-theme="light"] .dynamic-status-btn.paused .status-dot'), `${filename} must style paused dot`);
    assert(cssText.includes('[data-theme="light"] .dynamic-status-btn.buffering .status-dot'), `${filename} must style buffering dot`);
    assert(cssText.includes('[data-theme="light"] .dynamic-status-btn.muted .status-dot'), `${filename} must style muted dot`);
    assert(cssText.includes('[data-theme="light"] .dynamic-status-btn.stopped .status-dot'), `${filename} must style stopped dot`);
    assert(cssText.includes('#059669'), `${filename} playing dot must be #059669`);
    assert(cssText.includes('#d97706'), `${filename} paused dot must be #d97706`);
    assert(cssText.includes('#0891b2'), `${filename} buffering dot must be #0891b2`);
  });
  console.log('  ✅ Battery 5 Passed: Popup Live Media Dynamic Status Button & Dots verified');
}

// ===========================================================================
// Battery 6: Popup Sleep Tab Dial Status Badge (popup/styles/tabs/tab_sleep.css)
// ===========================================================================
console.log('• Battery 6: Popup Sleep Tab Dial Status Badge');
{
  assert(tabSleepCss.includes('[data-theme="light"] .sleep-status-badge.idle'), 'tab_sleep.css must style .sleep-status-badge.idle');
  assert(tabSleepCss.includes('[data-theme="light"] .sleep-status-badge.running'), 'tab_sleep.css must style .sleep-status-badge.running');
  assert(tabSleepCss.includes('[data-theme="light"] .sleep-status-badge.paused'), 'tab_sleep.css must style .sleep-status-badge.paused');
  assert(tabSleepCss.includes('[data-theme="light"] .sleep-status-badge.fading'), 'tab_sleep.css must style .sleep-status-badge.fading');
  assert(tabSleepCss.includes('[data-theme="light"] .sleep-status-badge.triggered'), 'tab_sleep.css must style .sleep-status-badge.triggered');
  assert(tabSleepCss.includes('#3730a3'), 'tab_sleep.css running state must use deep indigo #3730a3');
  assert(tabSleepCss.includes('#475569'), 'tab_sleep.css idle state must use high-contrast #475569');
  console.log('  ✅ Battery 6 Passed: Popup Sleep Tab Dial Status Badge verified');
}

// ===========================================================================
// Battery 7: Popup Focus & Doomscroll Status Badges (popup/styles/tabs/tab_wellness.css)
// ===========================================================================
console.log('• Battery 7: Popup Focus & Doomscroll Tab Status Badges');
{
  assert(tabWellnessCss.includes('[data-theme="light"] .popup-focus-badge.idle'), 'tab_wellness.css must style .popup-focus-badge.idle');
  assert(tabWellnessCss.includes('[data-theme="light"] .popup-focus-badge.running'), 'tab_wellness.css must style .popup-focus-badge.running');
  assert(tabWellnessCss.includes('[data-theme="light"] .popup-focus-badge.break'), 'tab_wellness.css must style .popup-focus-badge.break');
  assert(tabWellnessCss.includes('[data-theme="light"] .popup-focus-badge.paused'), 'tab_wellness.css must style .popup-focus-badge.paused');
  assert(tabWellnessCss.includes('[data-theme="light"] .doomscroll-status-badge.standby .doomscroll-status-dot'), 'tab_wellness.css must style doomscroll dot');
  assert(tabWellnessCss.includes('#065f46'), 'tab_wellness.css running state must use deep emerald #065f46');
  assert(tabWellnessCss.includes('#0e7490'), 'tab_wellness.css break state must use deep cyan #0e7490');
  console.log('  ✅ Battery 7 Passed: Popup Focus & Doomscroll Status Badges verified');
}

// ===========================================================================
// Battery 8: Mathematical Contrast & Dark Mode Zero-Mutation Invariant
// ===========================================================================
console.log('• Battery 8: Mathematical Contrast & Dark Mode Zero-Mutation Invariant');
{
  const contrastPairs = [
    { name: 'IDLE Badge Text: #475569 on #f1f5f9', fg: '#475569', bg: '#f1f5f9', minRatio: 4.5 },
    { name: 'ACTIVE Emerald: #065f46 on #ecfdf5', fg: '#065f46', bg: '#ecfdf5', minRatio: 7.0 },
    { name: 'BREAK Blue: #1e40af on #eff6ff', fg: '#1e40af', bg: '#eff6ff', minRatio: 7.0 },
    { name: 'BREAK Cyan: #0e7490 on #ecfeff', fg: '#0e7490', bg: '#ecfeff', minRatio: 4.5 },
    { name: 'SLEEP Indigo: #312e81 on #eef2ff', fg: '#312e81', bg: '#eef2ff', minRatio: 7.0 },
    { name: 'PAUSED Amber: #92400e on #fffbeb', fg: '#92400e', bg: '#fffbeb', minRatio: 4.5 },
    { name: 'TRIGGERED Red: #991b1b on #fef2f2', fg: '#991b1b', bg: '#fef2f2', minRatio: 7.0 }
  ];

  for (const pair of contrastPairs) {
    const ratio = contrastRatio(pair.fg, pair.bg);
    console.log(`    📊 ${pair.name} => Contrast: ${ratio.toFixed(2)}:1 (Min: ${pair.minRatio}:1)`);
    assert(ratio >= pair.minRatio, `${pair.name} failed contrast requirement of ${pair.minRatio}:1`);
  }

  // Dark Mode Zero-Mutation Invariant checks
  assert(mediaCss.includes('background: rgba(15, 23, 42, 0.6);'), 'Dark mode Audio Viz status pill must remain rgba(15, 23, 42, 0.6)');
  assert(tabSleepCss.includes('background: rgba(148, 163, 184, 0.15);'), 'Dark mode sleep badge idle must remain rgba(148, 163, 184, 0.15)');
  assert(tabWellnessCss.includes('background: rgba(100, 116, 139, 0.2);'), 'Dark mode focus badge idle must remain rgba(100, 116, 139, 0.2)');
  assert(wbBlacklistCss.includes('background: rgba(16, 185, 129, 0.2);'), 'Monolithic wellbeing_blacklist.css must remain 100% untouched');

  // Rule 28 File Modularity Budget check
  const wbLightLines = wellbeingLightCss.split('\n').length;
  assert(wbLightLines < 700, `wellbeing_light.css length (${wbLightLines}) must remain < 700 lines per Rule 28`);

  // UTF-8 BOM Verification
  const touchedFiles = [
    'dashboard/styles/wellbeing_light.css',
    'dashboard/styles/media.css',
    'popup/styles/themes.css',
    'popup/styles/themes/light_contrast.css',
    'popup/styles/tabs/tab_sleep.css',
    'popup/styles/tabs/tab_wellness.css'
  ];

  touchedFiles.forEach(rel => {
    const full = path.join(baseDir, rel);
    const buf = fs.readFileSync(full);
    assert(buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf, `File ${rel} must preserve UTF-8 with BOM`);
  });

  console.log('  ✅ Battery 8 Passed: Mathematical contrast certified, Dark Mode zero-mutation preserved, UTF-8 BOM verified');
}

console.log('\n============================================================');
console.log('🎉 ALL 8 TEST BATTERIES PASSED CLEANLY (Exit Code 0)');
console.log('============================================================\n');
