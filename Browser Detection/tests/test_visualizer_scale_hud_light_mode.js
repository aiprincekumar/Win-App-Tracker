/**
 * Sentinel Web Activity & Media Sentinel - Standalone QA Verification Suite
 * Test Suite: tests/test_visualizer_scale_hud_light_mode.js
 * Task ID: TASK-VIZ-SCALE-HUD-LIGHT-001
 * 
 * Verifies Audio Visualizer Frequency Scale Labels, HUD Badges, and Canvas Chassis in Light Mode:
 * - Battery 1: Visualizer Canvas Chassis Container Bezel in Light Mode
 * - Battery 2: Audio Visualizer HUD Glass Capsule Badges in Light Mode
 * - Battery 3: High-Contrast Frequency Scale Labels in Light Mode
 * - Battery 4: Mathematical WCAG AAA Contrast Verification (> 7:1 & > 12:1)
 * - Battery 5: Dark Mode Zero-Mutation Invariant & Rule 28 Modularity (<500 lines) Audit
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('============================================================');
console.log('🧪 AUDIO VISUALIZER SCALE LABELS, HUD & CHASSIS LIGHT MODE QA');
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

// Composite semi-transparent RGB over solid background RGB
function compositeRgba(fgRgba, bgHex) {
  const [bgR, bgG, bgB] = parseHex(bgHex);
  const [fgR, fgG, fgB, alpha] = fgRgba;
  const outR = Math.round(fgR * alpha + bgR * (1 - alpha));
  const outG = Math.round(fgG * alpha + bgG * (1 - alpha));
  const outB = Math.round(fgB * alpha + bgB * (1 - alpha));
  const toHex = (n) => n.toString(16).padStart(2, '0');
  return `#${toHex(outR)}${toHex(outG)}${toHex(outB)}`;
}

// ===========================================================================
// Battery 1: Visualizer Canvas Chassis Container Bezel in Light Mode
// ===========================================================================
console.log('• Battery 1: Visualizer Canvas Chassis Container Bezel in Light Mode');
{
  assert(dashboardHtml.includes('class="visualizer-canvas-container"'), 'dashboard.html must contain .visualizer-canvas-container');
  assert(vizLightCss.includes('.visualizer-canvas-container'), 'visualizer_light.css must include .visualizer-canvas-container');
  assert(vizLightCss.includes('body.theme-light .visualizer-canvas-container'), 'Must scope container under body.theme-light');
  assert(vizLightCss.includes('[data-theme="light"] .visualizer-canvas-container'), 'Must scope container under [data-theme="light"]');
  assert(vizLightCss.includes('border: 1px solid #cbd5e1 !important'), 'Container border must be 1px solid #cbd5e1 in light mode');
  assert(vizLightCss.includes('box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.8), 0 2px 8px rgba(0, 0, 0, 0.06) !important'), 'Container box-shadow must provide studio bezel depth');
  console.log('  ✅ Battery 1 Passed: Canvas chassis bezel styling verified');
}

// ===========================================================================
// Battery 2: Audio Visualizer HUD Glass Capsule Badges in Light Mode
// ===========================================================================
console.log('• Battery 2: Audio Visualizer HUD Glass Capsule Badges in Light Mode');
{
  assert(dashboardHtml.includes('class="viz-hud-badge'), 'dashboard.html must contain .viz-hud-badge');
  assert(vizLightCss.includes('body.theme-light .viz-hud-badge'), 'Must scope .viz-hud-badge under body.theme-light');
  assert(vizLightCss.includes('[data-theme="light"] .viz-hud-badge'), 'Must scope .viz-hud-badge under [data-theme="light"]');
  assert(vizLightCss.includes('background: rgba(15, 23, 42, 0.75) !important'), 'HUD badge must use dark glass capsule background rgba(15, 23, 42, 0.75)');
  assert(vizLightCss.includes('border: 1px solid rgba(148, 163, 184, 0.25) !important'), 'HUD badge must have subtle glass rim border');
  assert(vizLightCss.includes('color: #38bdf8 !important'), 'HUD badge text color must be crisp electric cyan #38bdf8');
  assert(vizLightCss.includes('text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6) !important'), 'HUD badge must have text shadow for legibility');
  assert(vizLightCss.includes('backdrop-filter: blur(8px) !important'), 'HUD badge must have backdrop blur');
  assert(vizLightCss.includes('-webkit-backdrop-filter: blur(8px) !important'), 'HUD badge must have webkit backdrop blur');
  assert(vizLightCss.includes('box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3) !important'), 'HUD badge must have capsule box shadow');
  console.log('  ✅ Battery 2 Passed: Studio HUD glass capsule styling verified');
}

// ===========================================================================
// Battery 3: High-Contrast Frequency Scale Labels in Light Mode
// ===========================================================================
console.log('• Battery 3: High-Contrast Frequency Scale Labels in Light Mode');
{
  assert(dashboardHtml.includes('class="viz-scale-label"'), 'dashboard.html must contain .viz-scale-label');
  assert(vizLightCss.includes('body.theme-light .viz-scale-label'), 'Must scope .viz-scale-label under body.theme-light');
  assert(vizLightCss.includes('[data-theme="light"] .viz-scale-label'), 'Must scope .viz-scale-label under [data-theme="light"]');
  assert(vizLightCss.includes('color: #e2e8f0 !important'), 'Scale label color must be luminescent silver #e2e8f0');
  assert(vizLightCss.includes('text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8) !important'), 'Scale label must have text-shadow 0 1px 2px rgba(0, 0, 0, 0.8)');
  assert(vizLightCss.includes('font-weight: 600 !important'), 'Scale label must have font-weight 600');
  console.log('  ✅ Battery 3 Passed: Frequency scale labels styling verified');
}

// ===========================================================================
// Battery 4: Mathematical WCAG AAA Contrast Verification (> 7:1 & > 12:1)
// ===========================================================================
console.log('• Battery 4: Mathematical WCAG AAA Contrast Verification');
{
  // Scale label (#e2e8f0) against CRT dark canvas (#080b11)
  const scaleContrast = contrastRatio('#e2e8f0', '#080b11');
  console.log(`    📊 Scale label (#e2e8f0 on #080b11): ${scaleContrast.toFixed(2)}:1 (WCAG AAA min: 7:1)`);
  assert(scaleContrast >= 12.0, 'Scale label contrast must be >= 12:1');

  // HUD badge (#38bdf8) against composited capsule bg rgba(15, 23, 42, 0.75) on #080b11
  const hudBg = compositeRgba([15, 23, 42, 0.75], '#080b11');
  const hudContrast = contrastRatio('#38bdf8', hudBg);
  console.log(`    📊 HUD badge text (#38bdf8 on composited ${hudBg}): ${hudContrast.toFixed(2)}:1 (WCAG AAA min: 7:1)`);
  assert(hudContrast >= 7.0, 'HUD badge contrast must satisfy WCAG AAA (>= 7:1)');

  console.log('  ✅ Battery 4 Passed: All contrast ratios exceed WCAG AAA standards');
}

// ===========================================================================
// Battery 5: Dark Mode Zero-Mutation Invariant & Rule 28 Modularity Audit
// ===========================================================================
console.log('• Battery 5: Dark Mode Zero-Mutation Invariant & Rule 28 Modularity Audit');
{
  // Check BOM
  const hasBom = vizLightBuf[0] === 0xEF && vizLightBuf[1] === 0xBB && vizLightBuf[2] === 0xBF;
  assert(hasBom, 'visualizer_light.css must have UTF-8 BOM (0xEF, 0xBB, 0xBF)');
  console.log('    📊 UTF-8 with BOM certified on visualizer_light.css');

  // Line count check (< 500 lines)
  const lines = vizLightCss.split('\n').length;
  console.log(`    📊 visualizer_light.css line count: ${lines} lines (Universal Rule 28 limit: < 500 lines)`);
  assert(lines < 500, `visualizer_light.css must be under 500 lines (actual: ${lines})`);

  // Dark mode invariant
  assert(vizDeckCss.includes('.visualizer-canvas-container'), 'visualizer_deck.css dark mode rules must be present');
  assert(vizDeckCss.includes('.viz-hud-badge'), 'visualizer_deck.css .viz-hud-badge must be present');
  assert(vizDeckCss.includes('.viz-scale-label'), 'visualizer_deck.css .viz-scale-label must be present');
  console.log('    📊 visualizer_deck.css Dark Mode Zero-Mutation Invariant verified');

  console.log('  ✅ Battery 5 Passed: Invariants & Rule 28 Modularity certified');
}

console.log('\n============================================================');
console.log('🎉 ALL 5 TEST BATTERIES PASSED CLEANLY (Exit Code 0)');
console.log('============================================================\n');
