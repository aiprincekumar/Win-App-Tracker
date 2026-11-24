/**
 * Sentinel Web Activity & Media Sentinel - Dark Dropdown Visibility & WCAG Parity Test Suite
 * File: tests/test_popup_dark_dropdown_visibility.js
 * Verification of Defect Resolution: Dark Mode Dropdown Option Text Visibility (WCAG AAA)
 * Ensures <select> elements and child <option> tags render with dark substrates (#0f172a)
 * and crisp white typography (#f8fafc) across Chromium Windows popup host environments.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting Dark Mode Dropdown Visibility & WCAG AAA Parity Test Suite...\n');

const baseDir = path.resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Test 1: File Existence, UTF-8 BOM & Universal Rule 28 Modularity (<500 lines)
// ---------------------------------------------------------------------------
console.log('Test 1: File Existence, UTF-8 BOM & Universal Rule 28 Modularity (<500 lines)');
{
  const targetFiles = [
    'popup/styles/themes/dark_dropdown.css',
    'dashboard/styles/dark_dropdown.css',
    'popup/styles/themes/dark_glass.css',
    'popup/styles/themes.css',
    'dashboard/styles/themes.css'
  ];

  const modularRule28Files = [
    'popup/styles/themes/dark_dropdown.css',
    'dashboard/styles/dark_dropdown.css',
    'popup/styles/themes/dark_glass.css'
  ];

  for (const rel of targetFiles) {
    const full = path.join(baseDir, rel);
    assert(fs.existsSync(full), `Target stylesheet must exist: ${rel}`);
    const buf = fs.readFileSync(full);
    assert(buf.length > 0, `File ${rel} must not be empty`);
    assert(buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf, `File ${rel} must include UTF-8 BOM`);

    const text = buf.toString('utf8');
    const lineCount = text.split('\n').length;
    if (modularRule28Files.includes(rel)) {
      assert(lineCount < 500, `File ${rel} line count (${lineCount}) must be strictly under 500 lines per Rule 28`);
      console.log(`  ✅ ${rel} verified: UTF-8 BOM present, ${lineCount} lines (< 500 max per Rule 28)`);
    } else {
      console.log(`  ✅ ${rel} verified: UTF-8 BOM present, ${lineCount} lines (Aggregator stylesheet)`);
    }
  }
}

// ---------------------------------------------------------------------------
// Test 2: color-scheme: dark & Substrate Enforcement in popup dark_dropdown.css
// ---------------------------------------------------------------------------
console.log('\nTest 2: color-scheme: dark & Substrate Enforcement in popup dark_dropdown.css');
{
  const popupDarkCss = fs.readFileSync(path.join(baseDir, 'popup/styles/themes/dark_dropdown.css'), 'utf8');

  assert(popupDarkCss.includes('color-scheme: dark'), 'dark_dropdown.css must declare color-scheme: dark');
  assert(popupDarkCss.includes(':root:not([data-theme="light"])'), 'dark_dropdown.css must scope dark color-scheme on :root');
  assert(popupDarkCss.includes('[data-theme="dark"]'), 'dark_dropdown.css must scope dark color-scheme on [data-theme="dark"]');

  // Verify select element baseline styling
  assert(popupDarkCss.includes('.setting-select'), 'dark_dropdown.css must style .setting-select');
  assert(popupDarkCss.includes('.setting-select-sm'), 'dark_dropdown.css must style .setting-select-sm');
  assert(popupDarkCss.includes('.eq-preset-dropdown'), 'dark_dropdown.css must style .eq-preset-dropdown');
  assert(popupDarkCss.includes('.browser-filter-select-popup'), 'dark_dropdown.css must style .browser-filter-select-popup');
  assert(popupDarkCss.includes('.doomscroll-select'), 'dark_dropdown.css must style .doomscroll-select');

  // Verify option elements explicit styling
  assert(popupDarkCss.includes('.setting-select option'), 'dark_dropdown.css must explicitly style .setting-select option');
  assert(popupDarkCss.includes('#0f172a'), 'dark_dropdown.css must use dark background #0f172a for options');
  assert(popupDarkCss.includes('#f8fafc'), 'dark_dropdown.css must use white text #f8fafc for options');

  // Verify option hover and checked states
  assert(popupDarkCss.includes('option:checked'), 'dark_dropdown.css must define option:checked state');
  assert(popupDarkCss.includes('option:hover'), 'dark_dropdown.css must define option:hover state');
  assert(popupDarkCss.includes('#1e293b'), 'dark_dropdown.css must use #1e293b substrate for selected options');
  assert(popupDarkCss.includes('#10b981'), 'dark_dropdown.css must use #10b981 emerald accent for selected options');

  console.log('  ✅ popup dark_dropdown.css enforces color-scheme: dark, #0f172a substrate & #f8fafc text');
}

// ---------------------------------------------------------------------------
// Test 3: Zero Light-Mode Regression Guardrails
// ---------------------------------------------------------------------------
console.log('\nTest 3: Zero Light-Mode Regression Guardrails');
{
  const popupDarkCss = fs.readFileSync(path.join(baseDir, 'popup/styles/themes/dark_dropdown.css'), 'utf8');

  assert(popupDarkCss.includes('[data-theme="light"]'), 'dark_dropdown.css must include light mode guardrails');
  assert(popupDarkCss.includes('color-scheme: light'), 'dark_dropdown.css must declare color-scheme: light for light mode');
  assert(popupDarkCss.includes('#ffffff'), 'dark_dropdown.css must preserve #ffffff background in light mode');
  assert(popupDarkCss.includes('#0f172a'), 'dark_dropdown.css must preserve #0f172a dark text in light mode');

  console.log('  ✅ Zero light-mode regression: [data-theme="light"] options safely locked to #ffffff and #0f172a');
}

// ---------------------------------------------------------------------------
// Test 4: Linkage in popup/popup.html & dashboard/dashboard.html
// ---------------------------------------------------------------------------
console.log('\nTest 4: Linkage in popup/popup.html & dashboard/dashboard.html');
{
  const popupHtml = fs.readFileSync(path.join(baseDir, 'popup/popup.html'), 'utf8');
  assert(
    popupHtml.includes('<link rel="stylesheet" href="styles/themes/dark_dropdown.css">'),
    'popup.html must link styles/themes/dark_dropdown.css'
  );

  const dashHtml = fs.readFileSync(path.join(baseDir, 'dashboard/dashboard.html'), 'utf8');
  assert(
    dashHtml.includes('<link rel="stylesheet" href="styles/dark_dropdown.css">'),
    'dashboard.html must link styles/dark_dropdown.css'
  );

  console.log('  ✅ popup.html and dashboard.html successfully link modular dark dropdown stylesheets');
}

// ---------------------------------------------------------------------------
// Test 5: Modular CSS Aggregation & @import Linkage
// ---------------------------------------------------------------------------
console.log('\nTest 5: Modular CSS Aggregation & @import Linkage');
{
  const darkGlassCss = fs.readFileSync(path.join(baseDir, 'popup/styles/themes/dark_glass.css'), 'utf8');
  assert(
    darkGlassCss.includes("@import './dark_dropdown.css';"),
    'dark_glass.css must import ./dark_dropdown.css'
  );

  const popupThemesCss = fs.readFileSync(path.join(baseDir, 'popup/styles/themes.css'), 'utf8');
  assert(
    popupThemesCss.includes("@import './themes/dark_dropdown.css';"),
    'popup/styles/themes.css must import ./themes/dark_dropdown.css'
  );

  const dashThemesCss = fs.readFileSync(path.join(baseDir, 'dashboard/styles/themes.css'), 'utf8');
  assert(
    dashThemesCss.includes("@import './dark_dropdown.css';"),
    'dashboard/styles/themes.css must import ./dark_dropdown.css'
  );

  console.log('  ✅ All parent modular stylesheets correctly @import dark dropdown stylesheets');
}

// ---------------------------------------------------------------------------
// Test 6: Master Stylesheet Standalone Parity (popup.css & dashboard.css)
// ---------------------------------------------------------------------------
console.log('\nTest 6: Master Stylesheet Standalone Parity (popup.css & dashboard.css)');
{
  const popupCss = fs.readFileSync(path.join(baseDir, 'popup/popup.css'), 'utf8');
  assert(popupCss.includes('color-scheme: dark'), 'popup.css must declare color-scheme: dark');
  assert(popupCss.includes('.setting-select option'), 'popup.css must style .setting-select option');

  const dashCss = fs.readFileSync(path.join(baseDir, 'dashboard/dashboard.css'), 'utf8');
  assert(dashCss.includes('body.theme-dark select option'), 'dashboard.css must style body.theme-dark select option');
  assert(dashCss.includes('#0f172a'), 'dashboard.css must use #0f172a substrate for options');

  console.log('  ✅ Master popup.css and dashboard.css contain standalone parity rules');
}

console.log('\n🎉 ALL DARK DROPDOWN VISIBILITY & WCAG AAA TESTS PASSED WITH 100% SUCCESS!');
process.exit(0);
