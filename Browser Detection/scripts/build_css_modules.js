const fs = require('fs');
const path = require('path');

function writeUtf8Bom(filePath, text) {
  if (text.charCodeAt(0) === 0xFEFF) {
    text = text.slice(1);
  }
  const bom = Buffer.from([0xef, 0xbb, 0xbf]);
  const content = Buffer.from(text, 'utf8');
  fs.writeFileSync(filePath, Buffer.concat([bom, content]));
}

// Ensure output directories exist
fs.mkdirSync(path.join('dashboard', 'styles'), { recursive: true });
fs.mkdirSync(path.join('popup', 'styles'), { recursive: true });

// Read original files
const dashContent = fs.readFileSync('dashboard/dashboard.css', 'utf8');
const dashLines = dashContent.split('\n');

const popupContent = fs.readFileSync('popup/popup.css', 'utf8');
const popupLines = popupContent.split('\n');

function getDashSlice(startLine, endLine) {
  return dashLines.slice(startLine - 1, endLine).join('\n');
}

function getPopupSlice(startLine, endLine) {
  return popupLines.slice(startLine - 1, endLine).join('\n');
}

// -------------------------------------------------------------
// DASHBOARD STYLES MODULARIZATION
// -------------------------------------------------------------

const dashTokens = [
  '/**',
  ' * Sentinel Web Activity & Media Sentinel - Dashboard Design Tokens',
  ' * File: dashboard/styles/tokens.css',
  ' * iOS 26 Liquid Glass & Specular Depth Engine Tokens',
  ' */',
  '',
  getDashSlice(1, 65).trim(),
  '',
  '/* Substrate Base Tokens & Root Defaults */',
  getDashSlice(4013, 4025).trim()
].join('\n') + '\n';

const dashLayout = [
  '/**',
  ' * Sentinel Web Activity & Media Sentinel - Dashboard Layout & Structure',
  ' * File: dashboard/styles/layout.css',
  ' * Reset, Grid Layout, Sidebar Navigation, Bento Container & Shimmer Loaders',
  ' */',
  '',
  getDashSlice(66, 81).trim(),
  '',
  getDashSlice(271, 525).trim(),
  '',
  getDashSlice(526, 836).trim(),
  '',
  getDashSlice(837, 1017).trim(),
  '',
  getDashSlice(2302, 2686).trim(),
  '',
  getDashSlice(2784, 2788).trim(),
  '',
  getDashSlice(4251, 4349).trim()
].join('\n') + '\n';

const dashTracking = [
  '/**',
  ' * Sentinel Web Activity & Media Sentinel - Tracking & Analytics Styles',
  ' * File: dashboard/styles/tracking.css',
  ' * Metrics Grid, Analytics Hero Card, Donut Charts & Modern Data Tables',
  ' */',
  '',
  getDashSlice(1018, 1111).trim(),
  '',
  getDashSlice(1112, 1182).trim(),
  '',
  getDashSlice(1183, 1350).trim(),
  '',
  getDashSlice(1351, 1417).trim(),
  '',
  getDashSlice(1418, 1667).trim(),
  '',
  getDashSlice(2789, 2836).trim(),
  '',
  getDashSlice(4350, 4384).trim()
].join('\n') + '\n';

const dashMedia = [
  '/**',
  ' * Sentinel Web Activity & Media Sentinel - Media Player & Scrubber Styles',
  ' * File: dashboard/styles/media.css',
  ' * Tab B: Live Media Player Hero Card, Precision Timeline Scrubber & Volume Controls',
  ' */',
  '',
  getDashSlice(1668, 1984).trim(),
  '',
  getDashSlice(1985, 2301).trim(),
  '',
  getDashSlice(3850, 4012).trim(),
  '',
  getDashSlice(4385, 4416).trim()
].join('\n') + '\n';

const dashAudioLab = [
  '/**',
  ' * Sentinel Web Activity & Media Sentinel - Audio Lab & Equalizer Styles',
  ' * File: dashboard/styles/audio_lab.css',
  ' * 5-Band Graphic Equalizer Studio Deck (.audio-eq-widget), Telemetry & Audio Enhancements',
  ' */',
  '',
  getDashSlice(2871, 3052).trim(),
  '',
  getDashSlice(3053, 3375).trim(),
  '',
  getDashSlice(3376, 3517).trim(),
  '',
  getDashSlice(4179, 4217).trim()
].join('\n') + '\n';

const dashPalette = [
  '/**',
  ' * Sentinel Web Activity & Media Sentinel - Omni Command Palette Styles',
  ' * File: dashboard/styles/palette.css',
  ' * Phase 2: Omni Command Palette Modal, Search Results & Kbd Badges',
  ' */',
  '',
  getDashSlice(3518, 3714).trim(),
  '',
  getDashSlice(4417, 4448).trim()
].join('\n') + '\n';

const dashHotkeys = [
  '/**',
  ' * Sentinel Web Activity & Media Sentinel - Modals & Keyboard Shortcuts Styles',
  ' * File: dashboard/styles/hotkeys.css',
  ' * Modal Dialog Component & Hotkeys Cheat Sheet Modal Card',
  ' */',
  '',
  getDashSlice(2687, 2783).trim(),
  '',
  getDashSlice(3715, 3796).trim()
].join('\n') + '\n';

const dashThemes = [
  '/**',
  ' * Sentinel Web Activity & Media Sentinel - Dashboard Themes & High Contrast Styles',
  ' * File: dashboard/styles/themes.css',
  ' * Light Mode Overrides, High Contrast Accessibility (WCAG AAA) & Focus Rings',
  ' */',
  '',
  getDashSlice(82, 270).trim(),
  '',
  getDashSlice(2837, 2870).trim(),
  '',
  getDashSlice(3797, 3842).trim(),
  '',
  getDashSlice(3843, 3849).trim(),
  '',
  getDashSlice(4026, 4178).trim(),
  '',
  getDashSlice(4218, 4250).trim()
].join('\n') + '\n';

writeUtf8Bom(path.join('dashboard', 'styles', 'tokens.css'), dashTokens);
writeUtf8Bom(path.join('dashboard', 'styles', 'layout.css'), dashLayout);
writeUtf8Bom(path.join('dashboard', 'styles', 'tracking.css'), dashTracking);
writeUtf8Bom(path.join('dashboard', 'styles', 'media.css'), dashMedia);
writeUtf8Bom(path.join('dashboard', 'styles', 'audio_lab.css'), dashAudioLab);
writeUtf8Bom(path.join('dashboard', 'styles', 'palette.css'), dashPalette);
writeUtf8Bom(path.join('dashboard', 'styles', 'hotkeys.css'), dashHotkeys);
writeUtf8Bom(path.join('dashboard', 'styles', 'themes.css'), dashThemes);

// Assemble Master Dashboard Stylesheet
const dashMaster = [
  '/**',
  ' * Sentinel Web Activity & Media Sentinel - Master Dashboard Stylesheet',
  ' * Aggregates modular stylesheets from dashboard/styles/ for zero-build parity and runtime elegance.',
  ' * Modules: tokens.css, layout.css, tracking.css, media.css, audio_lab.css, palette.css, hotkeys.css, themes.css',
  ' */',
  '',
  '/* ========================================================================= */',
  '/* 1. TOKENS & SYSTEM VARIABLES (styles/tokens.css)                          */',
  '/* ========================================================================= */',
  dashTokens.trim(),
  '',
  '/* ========================================================================= */',
  '/* 2. LAYOUT, SIDEBAR & BENTO GRID (styles/layout.css)                       */',
  '/* ========================================================================= */',
  dashLayout.trim(),
  '',
  '/* ========================================================================= */',
  '/* 3. TRACKING, METRICS & DATA TABLES (styles/tracking.css)                  */',
  '/* ========================================================================= */',
  dashTracking.trim(),
  '',
  '/* ========================================================================= */',
  '/* 4. MEDIA PLAYER & TIMELINE SCRUBBER (styles/media.css)                    */',
  '/* ========================================================================= */',
  dashMedia.trim(),
  '',
  '/* ========================================================================= */',
  '/* 5. AUDIO LAB & 5-BAND GRAPHIC EQUALIZER (styles/audio_lab.css)            */',
  '/* ========================================================================= */',
  dashAudioLab.trim(),
  '',
  '/* ========================================================================= */',
  '/* 6. OMNI COMMAND PALETTE (styles/palette.css)                              */',
  '/* ========================================================================= */',
  dashPalette.trim(),
  '',
  '/* ========================================================================= */',
  '/* 7. MODALS & HOTKEYS CHEAT SHEET (styles/hotkeys.css)                      */',
  '/* ========================================================================= */',
  dashHotkeys.trim(),
  '',
  '/* ========================================================================= */',
  '/* 8. THEMES, ACCENTS & ACCESSIBILITY (styles/themes.css)                     */',
  '/* ========================================================================= */',
  dashThemes.trim()
].join('\n') + '\n';

writeUtf8Bom(path.join('dashboard', 'dashboard.css'), dashMaster);

console.log('✅ Dashboard modular stylesheets & master dashboard.css written successfully!');

// -------------------------------------------------------------
// POPUP STYLES MODULARIZATION
// -------------------------------------------------------------

// Enforce 380px maximum popup width with zero horizontal overflow
let baseSlice = getPopupSlice(1, 147).trim();
baseSlice = baseSlice.replace(/width:\s*420px;/, 'width: 380px;\n  max-width: 380px;\n  /* Fixed 380px compact geometry (fallback support: width: 420px;) */');

const popupBase = [
  '/**',
  ' * Sentinel Web Activity & Media Sentinel - Popup Base Styles',
  ' * File: popup/styles/base.css',
  ' * Theme Tokens, Reset, Custom Scrollbar & Strict 380px Viewport Geometry',
  ' */',
  '',
  baseSlice
].join('\n') + '\n';

const popupHeader = [
  '/**',
  ' * Sentinel Web Activity & Media Sentinel - Popup Header & Status Badges',
  ' * File: popup/styles/header.css',
  ' * Header Brand, 30x30px Capsule Badges, Micro-Interactions, Status Pip & Toast Banner',
  ' */',
  '',
  getPopupSlice(148, 487).trim()
].join('\n') + '\n';

const popupTabs = [
  '/**',
  ' * Sentinel Web Activity & Media Sentinel - Popup Navigation & Views',
  ' * File: popup/styles/tabs.css',
  ' * 6-Tab Single-Word Navigation, Active Indicators, Media Player Card, Donut Chart & Domain List',
  ' */',
  '',
  getPopupSlice(488, 625).trim(),
  '',
  getPopupSlice(626, 927).trim(),
  '',
  getPopupSlice(928, 1255).trim(),
  '',
  getPopupSlice(1256, 1382).trim(),
  '',
  getPopupSlice(1383, 1674).trim(),
  '',
  getPopupSlice(2622, 2862).trim()
].join('\n') + '\n';

const popupQuickSettings = [
  '/**',
  ' * Sentinel Web Activity & Media Sentinel - Quick Settings & Action Footer',
  ' * File: popup/styles/quick_settings.css',
  ' * Quick Settings Popover, Smart Automations & Strict Single-Row Action Toolbar',
  ' */',
  '',
  getPopupSlice(1675, 1843).trim(),
  '',
  getPopupSlice(2177, 2396).trim()
].join('\n') + '\n';

const popupAudioLab = [
  '/**',
  ' * Sentinel Web Activity & Media Sentinel - Popup Audio Lab Styles',
  ' * File: popup/styles/audio_lab.css',
  ' * Tab 2: Audio Lab Styles, 5-Band Compact Equalizer & Sound Enhancements',
  ' */',
  '',
  getPopupSlice(2397, 2621).trim()
].join('\n') + '\n';

const popupWellness = [
  '/**',
  ' * Sentinel Web Activity & Media Sentinel - Focus & Digital Wellness Styles',
  ' * File: popup/styles/wellness.css',
  ' * Modern SVG Toolbar, Sleep Timer Popover Dialog & Doomscroll Breaker',
  ' */',
  '',
  getPopupSlice(1844, 2176).trim(),
  '',
  getPopupSlice(2863, 2963).trim()
].join('\n') + '\n';

const popupThemes = [
  '/**',
  ' * Sentinel Web Activity & Media Sentinel - Popup Themes & High Contrast Styles',
  ' * File: popup/styles/themes.css',
  ' * Defect 16: High Contrast Mode & Comprehensive Light Mode Overrides (WCAG AA Certified)',
  ' */',
  '',
  getPopupSlice(2964, 3080).trim(),
  '',
  getPopupSlice(3081, popupLines.length).trim()
].join('\n') + '\n';

writeUtf8Bom(path.join('popup', 'styles', 'base.css'), popupBase);
writeUtf8Bom(path.join('popup', 'styles', 'header.css'), popupHeader);
writeUtf8Bom(path.join('popup', 'styles', 'tabs.css'), popupTabs);
writeUtf8Bom(path.join('popup', 'styles', 'quick_settings.css'), popupQuickSettings);
writeUtf8Bom(path.join('popup', 'styles', 'audio_lab.css'), popupAudioLab);
writeUtf8Bom(path.join('popup', 'styles', 'wellness.css'), popupWellness);
writeUtf8Bom(path.join('popup', 'styles', 'themes.css'), popupThemes);

// Assemble Master Popup Stylesheet
const popupMaster = [
  '/**',
  ' * Sentinel Web Activity & Media Sentinel - Master Popup Stylesheet',
  ' * Aggregates modular stylesheets from popup/styles/ for zero-build parity and runtime elegance.',
  ' * Modules: base.css, header.css, tabs.css, quick_settings.css, audio_lab.css, wellness.css, themes.css',
  ' */',
  '',
  '/* ========================================================================= */',
  '/* 1. BASE, RESET & 380PX VIEWPORT GEOMETRY (styles/base.css)               */',
  '/* ========================================================================= */',
  popupBase.trim(),
  '',
  '/* ========================================================================= */',
  '/* 2. HEADER & STATUS BADGES (styles/header.css)                             */',
  '/* ========================================================================= */',
  popupHeader.trim(),
  '',
  '/* ========================================================================= */',
  '/* 3. NAVIGATION & VIEW PANES (styles/tabs.css)                              */',
  '/* ========================================================================= */',
  popupTabs.trim(),
  '',
  '/* ========================================================================= */',
  '/* 4. QUICK SETTINGS & ACTION FOOTER (styles/quick_settings.css)             */',
  '/* ========================================================================= */',
  popupQuickSettings.trim(),
  '',
  '/* ========================================================================= */',
  '/* 5. AUDIO LAB & EQUALIZER (styles/audio_lab.css)                           */',
  '/* ========================================================================= */',
  popupAudioLab.trim(),
  '',
  '/* ========================================================================= */',
  '/* 6. FOCUS & DIGITAL WELLNESS (styles/wellness.css)                         */',
  '/* ========================================================================= */',
  popupWellness.trim(),
  '',
  '/* ========================================================================= */',
  '/* 7. THEMES & ACCESSIBILITY (styles/themes.css)                             */',
  '/* ========================================================================= */',
  popupThemes.trim()
].join('\n') + '\n';

writeUtf8Bom(path.join('popup', 'popup.css'), popupMaster);

console.log('✅ Popup modular stylesheets & master popup.css written successfully!');
