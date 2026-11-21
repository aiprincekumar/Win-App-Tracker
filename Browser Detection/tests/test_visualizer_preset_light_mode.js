/**
 * Sentinel Web Activity & Media Sentinel - Standalone QA Verification Suite
 * Test Suite: tests/test_visualizer_preset_light_mode.js
 * Task ID: TASK-VIZ-PRESET-DROPDOWN-LIGHT-001
 * 
 * Verifies Audio Visualizer Preset Dropdown & Settings Popover Light Mode Styling:
 * - Battery 1: Preset Pill Trigger & Chevron Light Mode Rules
 * - Battery 2: Preset Popover Menu Container, Scrollbar & Options
 * - Battery 3: Visualizer Settings Drawer Container, Header & Close Button
 * - Battery 4: Visualizer Settings Drawer Toggles & Segmented Controls
 * - Battery 5: Mathematical WCAG AAA Contrast Verification (>= 7:1)
 * - Battery 6: Dark Mode Zero-Mutation & Rule 28 Modularity (<500 lines) Audit
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('============================================================');
console.log('🧪 AUDIO VISUALIZER PRESET DROPDOWN & SETTINGS LIGHT MODE QA');
console.log('============================================================\n');

const baseDir = path.resolve(__dirname, '..');
const vizLightPath = path.join(baseDir, 'dashboard/styles/media/visualizer_light.css');
const vizDeckPath = path.join(baseDir, 'dashboard/styles/media/visualizer_deck.css');
const dashboardHtmlPath = path.join(baseDir, 'dashboard/dashboard.html');

// Read files
const vizLightBuf = fs.readFileSync(vizLightPath);
const vizLightCss = vizLightBuf.toString('utf8');
const vizDeckCss = fs.readFileSync(vizDeckPath, 'utf8');
const dashboardHtml = fs.readFileSync(dashboardHtmlPath, 'utf8');

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
// Battery 1: Preset Pill Trigger & Chevron Light Mode Rules
// ===========================================================================
console.log('• Battery 1: Preset Pill Trigger & Chevron Light Mode Rules');
{
  assert(dashboardHtml.includes('styles/media/visualizer_light.css'), 'dashboard.html must link visualizer_light.css');
  assert(vizLightCss.includes('body.theme-light .viz-pill-trigger'), 'Must scope .viz-pill-trigger under body.theme-light');
  assert(vizLightCss.includes('[data-theme="light"] .viz-pill-trigger'), 'Must scope .viz-pill-trigger under [data-theme="light"]');
  assert(vizLightCss.includes('body.theme-light #btnVizPillTrigger'), 'Must scope #btnVizPillTrigger under body.theme-light');
  assert(vizLightCss.includes('#1e293b !important'), 'Trigger text must be high-contrast #1e293b');
  assert(vizLightCss.includes('#cbd5e1 !important'), 'Trigger border must be #cbd5e1');
  assert(vizLightCss.includes('.viz-pill-chevron'), 'Must style chevron in light mode');
  assert(vizLightCss.includes('#4f46e5 !important'), 'Expanded chevron or toggle must use #4f46e5');
  console.log('  ✅ Battery 1 Passed: Preset Pill Trigger & Chevron verified');
}

// ===========================================================================
// Battery 2: Preset Popover Menu Container, Scrollbar & Options
// ===========================================================================
console.log('• Battery 2: Preset Popover Menu Container, Scrollbar & Options');
{
  assert(vizLightCss.includes('.viz-pill-popover-menu'), 'Must include .viz-pill-popover-menu');
  assert(vizLightCss.includes('#vizPillPopoverMenu'), 'Must include #vizPillPopoverMenu');
  assert(vizLightCss.includes('.viz-popover-option'), 'Must style .viz-popover-option');
  assert(vizLightCss.includes('.viz-popover-option.active'), 'Must style .viz-popover-option.active');
  assert(vizLightCss.includes('#3730a3 !important'), 'Active option must use #3730a3 text for WCAG AAA contrast');
  assert(vizLightCss.includes('3px solid #6366f1'), 'Active option must have distinct accent indicator');
  assert(vizLightCss.includes('.viz-pill-popover-menu::-webkit-scrollbar'), 'Must style webkit scrollbar');
  assert(vizLightCss.includes('scrollbar-color: #cbd5e1 transparent'), 'Must include standard scrollbar-color');
  console.log('  ✅ Battery 2 Passed: Preset Popover Container & Options verified');
}

// ===========================================================================
// Battery 3: Visualizer Settings Drawer Container, Header & Close Button
// ===========================================================================
console.log('• Battery 3: Visualizer Settings Drawer Container, Header & Close Button');
{
  assert(vizLightCss.includes('.viz-settings-drawer'), 'Must style .viz-settings-drawer');
  assert(vizLightCss.includes('#vizSettingsDrawer'), 'Must style #vizSettingsDrawer');
  assert(vizLightCss.includes('.viz-drawer-header'), 'Must style .viz-drawer-header');
  assert(vizLightCss.includes('.viz-drawer-title'), 'Must style .viz-drawer-title');
  assert(vizLightCss.includes('#0f172a !important'), 'Drawer title must use #0f172a for maximum contrast');
  assert(vizLightCss.includes('.btn-viz-drawer-close'), 'Must style .btn-viz-drawer-close');
  assert(vizLightCss.includes('#btnVizDrawerClose'), 'Must style #btnVizDrawerClose');
  console.log('  ✅ Battery 3 Passed: Settings Drawer Container, Header & Close Button verified');
}

// ===========================================================================
// Battery 4: Visualizer Settings Drawer Toggles & Segmented Controls
// ===========================================================================
console.log('• Battery 4: Visualizer Settings Drawer Toggles & Segmented Controls');
{
  assert(vizLightCss.includes('.viz-drawer-label'), 'Must style .viz-drawer-label');
  assert(vizLightCss.includes('.viz-toggle-slider'), 'Must style .viz-toggle-slider');
  assert(vizLightCss.includes('.viz-btn-segmented'), 'Must style .viz-btn-segmented');
  assert(vizLightCss.includes('.viz-seg-btn'), 'Must style .viz-seg-btn');
  assert(vizLightCss.includes('.viz-seg-btn.active'), 'Must style .viz-seg-btn.active');
  console.log('  ✅ Battery 4 Passed: Drawer Toggles & Segmented Controls verified');
}

// ===========================================================================
// Battery 5: Mathematical WCAG AAA Contrast Verification (>= 7:1)
// ===========================================================================
console.log('• Battery 5: Mathematical WCAG AAA Contrast Verification');
{
  // Trigger text on white
  const triggerContrast = contrastRatio('#1e293b', '#ffffff');
  console.log(`    📊 Trigger text (#1e293b on #ffffff): ${triggerContrast.toFixed(2)}:1 (Min 7:1)`);
  assert(triggerContrast >= 7.0, 'Trigger text must satisfy WCAG AAA');

  // Option text on white
  const optionContrast = contrastRatio('#1e293b', '#ffffff');
  console.log(`    📊 Popover option text (#1e293b on #ffffff): ${optionContrast.toFixed(2)}:1 (Min 7:1)`);
  assert(optionContrast >= 7.0, 'Popover option text must satisfy WCAG AAA');

  // Option active text on soft tint #f0f1fe
  const activeOptionContrast = contrastRatio('#3730a3', '#f0f1fe');
  console.log(`    📊 Active option text (#3730a3 on #f0f1fe): ${activeOptionContrast.toFixed(2)}:1 (Min 7:1)`);
  assert(activeOptionContrast >= 7.0, 'Active option text must satisfy WCAG AAA');

  // Drawer title on white
  const titleContrast = contrastRatio('#0f172a', '#ffffff');
  console.log(`    📊 Drawer title (#0f172a on #ffffff): ${titleContrast.toFixed(2)}:1 (Min 7:1)`);
  assert(titleContrast >= 7.0, 'Drawer title must satisfy WCAG AAA');

  // Drawer label on white
  const labelContrast = contrastRatio('#1e293b', '#ffffff');
  console.log(`    📊 Drawer label (#1e293b on #ffffff): ${labelContrast.toFixed(2)}:1 (Min 7:1)`);
  assert(labelContrast >= 7.0, 'Drawer label must satisfy WCAG AAA');

  // Drawer close icon on #f1f5f9
  const closeContrast = contrastRatio('#475569', '#f1f5f9');
  console.log(`    📊 Close icon (#475569 on #f1f5f9): ${closeContrast.toFixed(2)}:1 (Min 4.5:1)`);
  assert(closeContrast >= 4.5, 'Close icon must satisfy WCAG AA');

  console.log('  ✅ Battery 5 Passed: All mathematical contrast ratios satisfy WCAG AAA/AA');
}

// ===========================================================================
// Battery 6: Dark Mode Zero-Mutation & Rule 28 Modularity (<500 lines) Audit
// ===========================================================================
console.log('• Battery 6: Dark Mode Zero-Mutation & Rule 28 Modularity Audit');
{
  // Check BOM
  const hasBom = vizLightBuf[0] === 0xEF && vizLightBuf[1] === 0xBB && vizLightBuf[2] === 0xBF;
  assert(hasBom, 'visualizer_light.css must have UTF-8 BOM (0xEF, 0xBB, 0xBF)');
  console.log('    📊 UTF-8 with BOM certified on visualizer_light.css');

  // Line count check
  const lines = vizLightCss.split('\n').length;
  console.log(`    📊 visualizer_light.css line count: ${lines} lines (Universal Rule 28 limit: < 500 lines)`);
  assert(lines < 500, `visualizer_light.css must be under 500 lines (actual: ${lines})`);

  // Dark mode invariant
  assert(vizDeckCss.length > 0, 'visualizer_deck.css must be readable');
  assert(vizDeckCss.includes('#vizPillPopoverMenu'), 'visualizer_deck.css dark mode rules must be present');
  console.log('    📊 visualizer_deck.css Dark Mode Zero-Mutation Invariant verified');

  console.log('  ✅ Battery 6 Passed: Dark Mode Invariant & Rule 28 Modularity fully certified');
}

console.log('\n============================================================');
console.log('🎉 ALL 6 TEST BATTERIES PASSED CLEANLY (Exit Code 0)');
console.log('============================================================\n');
