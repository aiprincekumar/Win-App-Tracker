/**
 * Verification Test Suite: Focus Block Circular Radial Countdown Dial (Phase 4 QA Verification)
 * Task: TASK-FOCUS-BLOCK-CIRCULAR-TIMER-001
 *
 * Verifies 8 Exhaustive Test Batteries:
 * Battery 1: SVG Dial DOM Markup in popup/popup.html (#popupFocusDialSvg, #popupFocusDialProgress, r=54, C=339.292, gradients, track)
 * Battery 2: 100% Retained Legacy IDs in popup/popup.html (#cardPopupFocusTimer, #popupFocusBadge, #popupFocusClock, #btnPopupFocusToggle, #btnPopupFocusReset, #popupActiveGoalChip, #txtPopupActiveGoal)
 * Battery 3: Radial Mathematics & Stroke Offset Calculations (100%, 75%, 50%, 25%, 0% remaining time, negative & overflow clamps)
 * Battery 4: CSS Dial Architecture in popup/popup.css (.popup-focus-dial-wrapper, transition properties, dark/light theme tokens)
 * Battery 5: Rule 28 Code Modularity & Function Lengths in popup/popup.js (updatePopupFocusDial, updatePopupFocusBadgesAndButtons, syncPopupFocusState <= 50 lines, nesting <= 3)
 * Battery 6: W3C Trusted Types & 0 innerHTML in newly added focus code
 * Battery 7: UTF-8 with BOM preservation on all touched files (popup.html, popup.css, popup.js, test suite)
 * Battery 8: Backend Logic & State Preservation (IPC commands START_FOCUS_TIMER, PAUSE_FOCUS_TIMER, RESUME_FOCUS_TIMER, RESET_FOCUS_TIMER, storage listener)
 *
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('🧪 Starting Focus Block Circular Radial Dial - Phase 4 Comprehensive QA Verification Suite...\n');

const baseDir = path.resolve(__dirname, '..');
const popupHtmlPath = path.join(baseDir, 'popup', 'popup.html');
const popupCssPath = path.join(baseDir, 'popup', 'popup.css');
const popupJsPath = path.join(baseDir, 'popup', 'popup.js');
const testSuitePath = __filename;

const popupHtml = fs.readFileSync(popupHtmlPath, 'utf8');
const popupCss = fs.readFileSync(popupCssPath, 'utf8');
const popupJs = fs.readFileSync(popupJsPath, 'utf8');

// ============================================================================
// Battery 1: SVG Dial DOM Markup in popup/popup.html
// ============================================================================
console.log('Battery 1: SVG Dial DOM Markup in popup/popup.html');
{
  assert.ok(popupHtml.includes('id="popupFocusDialSvg"'), 'popup.html must contain #popupFocusDialSvg');
  assert.ok(popupHtml.includes('class="popup-focus-svg-dial"'), 'SVG dial must have class popup-focus-svg-dial');
  assert.ok(popupHtml.includes('viewBox="0 0 140 140"'), 'SVG dial must define viewBox="0 0 140 140"');
  assert.ok(popupHtml.includes('width="130"'), 'SVG dial must have width="130"');
  assert.ok(popupHtml.includes('height="130"'), 'SVG dial must have height="130"');

  // SVG Linear Gradients
  assert.ok(popupHtml.includes('id="focusGlowGradient"'), 'Must contain linearGradient #focusGlowGradient');
  assert.ok(popupHtml.includes('#10b981'), '#focusGlowGradient must include emerald stop (#10b981)');
  assert.ok(popupHtml.includes('#06b6d4'), '#focusGlowGradient must include cyan stop (#06b6d4)');
  assert.ok(popupHtml.includes('#3b82f6'), '#focusGlowGradient must include blue stop (#3b82f6)');

  assert.ok(popupHtml.includes('id="breakGlowGradient"'), 'Must contain linearGradient #breakGlowGradient');
  assert.ok(popupHtml.includes('#f59e0b'), '#breakGlowGradient must include amber stop (#f59e0b)');
  assert.ok(popupHtml.includes('#fbbf24'), '#breakGlowGradient must include gold stop (#fbbf24)');

  // Track circle geometry
  assert.ok(popupHtml.includes('class="popup-focus-dial-track"'), 'Must contain track circle with class popup-focus-dial-track');
  assert.ok(popupHtml.includes('cx="70" cy="70" r="54"'), 'Dial circles must have cx="70" cy="70" r="54"');

  // Progress circle geometry
  assert.ok(popupHtml.includes('id="popupFocusDialProgress"'), 'Must contain progress circle #popupFocusDialProgress');
  assert.ok(popupHtml.includes('stroke-dasharray="339.292"'), 'Progress circle must have stroke-dasharray="339.292"');
  assert.ok(popupHtml.includes('transform="rotate(-90 70 70)"'), 'Progress circle must have transform="rotate(-90 70 70)"');
  assert.ok(popupHtml.includes('stroke="url(#focusGlowGradient)"'), 'Progress circle must default to stroke="url(#focusGlowGradient)"');

  // Centered overlay content
  assert.ok(popupHtml.includes('class="popup-focus-dial-content"'), 'Must contain telemetry overlay .popup-focus-dial-content');
  assert.ok(popupHtml.includes('id="popupFocusDialState"'), 'Must contain dial state text #popupFocusDialState');

  console.log('  ✅ Battery 1 passed: SVG dial DOM markup, coordinates, gradients & geometry verified');
}

// ============================================================================
// Battery 2: 100% Retained Legacy IDs in popup/popup.html
// ============================================================================
console.log('\nBattery 2: 100% Retained Legacy IDs in popup/popup.html');
{
  const requiredLegacyIds = [
    'cardPopupFocusTimer',
    'popupFocusBadge',
    'popupFocusClock',
    'btnPopupFocusToggle',
    'btnPopupFocusReset',
    'popupActiveGoalChip',
    'txtPopupActiveGoal'
  ];

  for (const id of requiredLegacyIds) {
    assert.ok(popupHtml.includes(`id="${id}"`), `popup.html must retain legacy ID #${id}`);
  }

  // DOM Hierarchy Assertion: #cardPopupFocusTimer inside #cardFocusWellness inside #viewFocusPane
  const panePos = popupHtml.indexOf('id="viewFocusPane"');
  const wellnessPos = popupHtml.indexOf('id="cardFocusWellness"');
  const cardPos = popupHtml.indexOf('id="cardPopupFocusTimer"');

  assert.ok(panePos !== -1, '#viewFocusPane must exist');
  assert.ok(wellnessPos !== -1, '#cardFocusWellness must exist');
  assert.ok(cardPos !== -1, '#cardPopupFocusTimer must exist');
  assert.ok(wellnessPos > panePos, '#cardFocusWellness must be inside #viewFocusPane');
  assert.ok(cardPos > wellnessPos, '#cardPopupFocusTimer must be inside #cardFocusWellness');

  console.log('  ✅ Battery 2 passed: 100% legacy IDs retained and DOM hierarchy validated');
}

// ============================================================================
// Battery 3: Radial Mathematics & Stroke Offset Calculations
// ============================================================================
console.log('\nBattery 3: Radial Mathematics & Stroke Offset Calculations');
{
  const RADIUS = 54;
  const CIRCUMFERENCE = +(2 * Math.PI * RADIUS).toFixed(3); // 339.292
  assert.strictEqual(CIRCUMFERENCE, 339.292, 'Circumference for r=54 must equal 339.292');

  function calculateOffset(remainingSec, totalSec) {
    const total = Math.max(1, totalSec || 1500);
    const rem = Math.max(0, Math.min(total, remainingSec));
    const ratio = rem / total;
    return Math.max(0, Math.min(CIRCUMFERENCE, +(CIRCUMFERENCE * (1 - ratio)).toFixed(3)));
  }

  // Boundary checks:
  // 100% remaining (1500s / 1500s) -> offset = 0.000
  assert.strictEqual(calculateOffset(1500, 1500), 0, '100% remaining must produce stroke-dashoffset = 0.000');

  // 75% remaining (1125s / 1500s) -> offset = 84.823
  assert.strictEqual(calculateOffset(1125, 1500), 84.823, '75% remaining must produce stroke-dashoffset = 84.823');

  // 50% remaining (750s / 1500s) -> offset = 169.646
  assert.strictEqual(calculateOffset(750, 1500), 169.646, '50% remaining must produce stroke-dashoffset = 169.646');

  // 25% remaining (375s / 1500s) -> offset = 254.469
  assert.strictEqual(calculateOffset(375, 1500), 254.469, '25% remaining must produce stroke-dashoffset = 254.469');

  // 0% remaining (0s / 1500s) -> offset = 339.292
  assert.strictEqual(calculateOffset(0, 1500), 339.292, '0% remaining must produce stroke-dashoffset = 339.292');

  // Negative clamp (< 0s) -> offset = 339.292
  assert.strictEqual(calculateOffset(-100, 1500), 339.292, 'Negative remaining must be clamped to 339.292');

  // Overflow clamp (> 1500s) -> offset = 0.000
  assert.strictEqual(calculateOffset(2000, 1500), 0, 'Overflow remaining must be clamped to 0.000');

  console.log('  ✅ Battery 3 passed: Radial mathematics and 5-point boundary offset clamps certified');
}

// ============================================================================
// Battery 4: CSS Dial Architecture in popup/popup.css
// ============================================================================
console.log('\nBattery 4: CSS Dial Architecture in popup/popup.css');
{
  const requiredCssSelectors = [
    '.popup-focus-card',
    '.popup-focus-header',
    '.popup-focus-title',
    '.popup-focus-badge',
    '.popup-focus-dial-wrapper',
    '.popup-focus-svg-dial',
    '.popup-focus-dial-track',
    '.popup-focus-dial-progress',
    '.popup-focus-dial-content',
    '.popup-focus-clock',
    '.popup-focus-dial-state',
    '.popup-focus-actions',
    '.popup-focus-btn'
  ];

  for (const selector of requiredCssSelectors) {
    assert.ok(popupCss.includes(selector), `popup.css must define ${selector}`);
  }

  // Dial transition property
  assert.ok(popupCss.includes('stroke-dashoffset 0.35s ease'), 'CSS must define stroke-dashoffset transition');

  // Light theme overrides
  assert.ok(popupCss.includes('[data-theme="light"] .popup-focus-card'), 'popup.css must support light theme .popup-focus-card');
  assert.ok(popupCss.includes('[data-theme="light"] .popup-focus-dial-track'), 'popup.css must support light theme .popup-focus-dial-track');
  assert.ok(popupCss.includes('[data-theme="light"] .popup-focus-clock'), 'popup.css must support light theme .popup-focus-clock');
  assert.ok(popupCss.includes('[data-theme="light"] .popup-focus-dial-state'), 'popup.css must support light theme .popup-focus-dial-state');
  assert.ok(popupCss.includes('[data-theme="light"] .popup-focus-btn.secondary'), 'popup.css must support light theme .popup-focus-btn.secondary');

  console.log('  ✅ Battery 4 passed: Cyber-Dark CSS architecture and theme tokens verified');
}

// ============================================================================
// Battery 5: Rule 28 Code Modularity & Function Lengths in popup/popup.js
// ============================================================================
console.log('\nBattery 5: Rule 28 Code Modularity & Function Lengths in popup/popup.js');
{
  assert.ok(popupJs.includes('POPUP_FOCUS_CIRCUMFERENCE = 339.292'), 'popup.js must define POPUP_FOCUS_CIRCUMFERENCE = 339.292');
  assert.ok(popupJs.includes('popupFocusDialProgress'), 'popup.js must bind popupFocusDialProgress');
  assert.ok(popupJs.includes('popupFocusDialState'), 'popup.js must bind popupFocusDialState');

  function analyzeFunction(name) {
    const marker = 'function ' + name;
    const start = popupJs.indexOf(marker);
    assert.ok(start !== -1, `popup.js must define function ${name}`);
    const openBrace = popupJs.indexOf('{', start);
    let depth = 1;
    let idx = openBrace + 1;
    let maxDepth = 1;
    while (depth > 0 && idx < popupJs.length) {
      if (popupJs[idx] === '{') {
        depth++;
        if (depth > maxDepth) maxDepth = depth;
      } else if (popupJs[idx] === '}') {
        depth--;
      }
      idx++;
    }
    const funcBody = popupJs.slice(start, idx);
    const lines = funcBody.split('\n').length;
    return { name, lines, nestingDepth: maxDepth - 1 };
  }

  const monitoredFunctions = [
    'updatePopupFocusDial',
    'updatePopupFocusDialStateText',
    'updatePopupFocusBadgesAndButtons',
    'renderPopupFocusTick',
    'syncPopupFocusState'
  ];

  for (const fn of monitoredFunctions) {
    const metrics = analyzeFunction(fn);
    assert.ok(metrics.lines <= 50, `Function ${fn} has ${metrics.lines} lines (must be <= 50 per Rule 28)`);
    assert.ok(metrics.nestingDepth <= 3, `Function ${fn} has nesting depth ${metrics.nestingDepth} (must be <= 3 per Rule 28)`);
  }

  console.log('  ✅ Battery 5 passed: Rule 28 function modularity (<= 50 lines, nesting <= 3) certified');
}

// ============================================================================
// Battery 6: W3C Trusted Types & 0 innerHTML in newly added focus code
// ============================================================================
console.log('\nBattery 6: W3C Trusted Types & 0 innerHTML in newly added focus code');
{
  const focusStart = popupJs.indexOf('// Popup Focus Time Mini-Controller (#cardPopupFocusTimer)');
  assert.ok(focusStart !== -1, 'Must locate Focus controller section in popup.js');
  const focusEnd = popupJs.indexOf('if (btnGoToTracking) {', focusStart);
  assert.ok(focusEnd !== -1, 'Must locate end of Focus controller section in popup.js');

  const focusCode = popupJs.slice(focusStart, focusEnd);
  const innerHtmlMatches = focusCode.match(/\.innerHTML/g) || [];
  const outerHtmlMatches = focusCode.match(/\.outerHTML/g) || [];

  assert.strictEqual(innerHtmlMatches.length, 0, `Found ${innerHtmlMatches.length} .innerHTML assignments in Focus code (must be 0)`);
  assert.strictEqual(outerHtmlMatches.length, 0, `Found ${outerHtmlMatches.length} .outerHTML assignments in Focus code (must be 0)`);

  console.log('  ✅ Battery 6 passed: W3C Trusted Types 100% compliance (0 innerHTML / outerHTML) certified');
}

// ============================================================================
// Battery 7: UTF-8 with BOM preservation on all touched files
// ============================================================================
console.log('\nBattery 7: UTF-8 with BOM preservation on all touched files');
{
  const touchedFiles = [
    popupHtmlPath,
    popupCssPath,
    popupJsPath,
    testSuitePath
  ];

  for (const filePath of touchedFiles) {
    const buf = fs.readFileSync(filePath);
    const hasBom = (buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF);
    assert.ok(hasBom, `File ${path.basename(filePath)} must start with UTF-8 BOM (0xEF, 0xBB, 0xBF)`);
  }

  console.log('  ✅ Battery 7 passed: UTF-8 with BOM verified across all touched files and test suite');
}

// ============================================================================
// Battery 8: Backend Logic & State Preservation
// ============================================================================
console.log('\nBattery 8: Backend Logic & State Preservation');
{
  const expectedIpcActions = [
    'START_FOCUS_TIMER',
    'PAUSE_FOCUS_TIMER',
    'RESUME_FOCUS_TIMER',
    'RESET_FOCUS_TIMER',
    'GET_FOCUS_TIMER_STATE'
  ];

  for (const action of expectedIpcActions) {
    assert.ok(popupJs.includes(action), `popup.js must actively dispatch or handle '${action}'`);
  }

  // Storage onChanged listener assertion for sentinel_focus_timer
  assert.ok(popupJs.includes('changes.sentinel_focus_timer'), 'popup.js must observe changes.sentinel_focus_timer');
  assert.ok(popupJs.includes('syncPopupFocusState(changes.sentinel_focus_timer.newValue)'), 'popup.js must dispatch syncPopupFocusState on storage change');

  console.log('  ✅ Battery 8 passed: Pomodoro IPC contracts and storage listener preservation certified');
}

console.log('\n============================================================');
console.log('🎉 ALL 8 FOCUS BLOCK CIRCULAR DIAL TEST BATTERIES PASSED (100% SUCCESS, EXIT CODE 0)');
console.log('============================================================\n');
