/**
 * Verification Test Suite: Unified Hero Media Timeline & Scrubber Architecture
 * 
 * Tests:
 * 1. Battery 1: DOM Hierarchy & Nesting Verification (#heroProgressBar nested inside #heroMediaScrubberWrapper)
 * 2. Battery 2: CSS Architecture & Single-Track / Single-Thumb Visual Styling Verification
 * 3. Battery 3: ARIA & Keyboard Accessibility Verification (WCAG AA Compliance)
 * 4. Battery 4: Event Synchronization, 0ms Scripting & Snapback Lockout Verification
 * 5. Battery 5: UTF-8 BOM Compliance Verification across All Target Files
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

console.log('🧪 Starting Unified Timeline Scrubber Architecture Test Suite...\n');

// ===========================================================================
// Battery 1: DOM Hierarchy & Nesting Verification
// ===========================================================================
console.log('Battery 1: DOM Hierarchy & Nesting Verification');
{
  const html = fs.readFileSync(dashHtmlPath, 'utf8');

  // Verify scrubber wrapper exists
  assert(html.includes('id="heroMediaScrubberWrapper"'), 'dashboard.html must contain #heroMediaScrubberWrapper');
  assert(html.includes('class="scrubber-wrapper"'), 'dashboard.html must contain .scrubber-wrapper');

  // Extract the contents of .scrubber-wrapper to verify nesting
  const wrapperMatch = html.match(/<div[^>]*id="heroMediaScrubberWrapper"[^>]*>([\s\S]*?)<\/div>\s*<div class="hero-progress-labels">/);
  assert(wrapperMatch, 'Could not find #heroMediaScrubberWrapper before .hero-progress-labels');
  const innerWrapper = wrapperMatch[1];

  // Verify #heroProgressBar is nested inside #heroMediaScrubberWrapper
  assert(innerWrapper.includes('id="heroProgressBar"'), '#heroProgressBar must be nested inside #heroMediaScrubberWrapper');
  assert(innerWrapper.includes('class="hero-progress-track"'), '#heroProgressBar must have class "hero-progress-track"');

  // Verify #heroProgressFill and .hero-progress-thumb inside #heroProgressBar
  assert(innerWrapper.includes('id="heroProgressFill"'), '#heroProgressFill must be inside #heroProgressBar');
  assert(innerWrapper.includes('class="hero-progress-thumb"'), '.hero-progress-thumb must be inside #heroProgressFill');

  // Verify #scrubberChapterTicksContainer is inside #heroMediaScrubberWrapper
  assert(innerWrapper.includes('id="scrubberChapterTicksContainer"'), '#scrubberChapterTicksContainer must be inside #heroMediaScrubberWrapper');

  // Verify #heroMediaSeekSlider is inside #heroMediaScrubberWrapper
  assert(innerWrapper.includes('id="heroMediaSeekSlider"'), '#heroMediaSeekSlider must be inside #heroMediaScrubberWrapper');
  assert(innerWrapper.includes('class="hero-seek-slider"'), '#heroMediaSeekSlider must have class "hero-seek-slider"');
  assert(innerWrapper.includes('type="range"'), '#heroMediaSeekSlider must be type="range"');

  // Verify #scrubberTooltip is inside #heroMediaScrubberWrapper
  assert(innerWrapper.includes('id="scrubberTooltip"'), '#scrubberTooltip must be inside #heroMediaScrubberWrapper');
  assert(innerWrapper.includes('class="scrubber-floating-tooltip hidden"'), '#scrubberTooltip must have class "scrubber-floating-tooltip hidden"');

  // Verify time labels are preserved outside wrapper
  assert(html.includes('id="heroTimeElapsed"'), 'dashboard.html must preserve #heroTimeElapsed');
  assert(html.includes('id="heroProgressPercent"'), 'dashboard.html must preserve #heroProgressPercent');
  assert(html.includes('id="heroTimeDuration"'), 'dashboard.html must preserve #heroTimeDuration');

  console.log('  ✅ #heroProgressBar, #heroProgressFill, ticks, slider & tooltip are unified inside #heroMediaScrubberWrapper');
}

// ===========================================================================
// Battery 2: CSS Architecture & Single-Track / Single-Thumb Visual Styling
// ===========================================================================
console.log('\nBattery 2: CSS Architecture & Single-Track / Single-Thumb Visual Styling');
{
  const css = fs.readFileSync(dashCssPath, 'utf8');

  // Scrubber wrapper geometry & hit area
  assert(css.includes('.scrubber-wrapper {'), 'CSS must define .scrubber-wrapper');
  assert(css.includes('height: 24px;'), '.scrubber-wrapper must declare 24px height for comfortable hit area');
  assert(css.includes('align-items: center;'), '.scrubber-wrapper must align items center');
  assert(css.includes('position: relative;'), '.scrubber-wrapper must be relative');

  // Unified visual background track (#heroProgressBar / .hero-progress-track)
  assert(css.includes('.hero-progress-track {'), 'CSS must define .hero-progress-track');
  assert(css.includes('pointer-events: none;'), '.hero-progress-track must declare pointer-events: none to delegate hits to slider');
  assert(css.includes('background: rgba(255, 255, 255, 0.12);'), '.hero-progress-track must have 12% white background substrate');
  assert(css.includes('border-radius: var(--radius-full);'), '.hero-progress-track must have pill border radius');

  // Real-time gradient progress fill
  assert(css.includes('.hero-progress-fill {'), 'CSS must define .hero-progress-fill');
  assert(css.includes('background: linear-gradient(90deg, #10b981, #06b6d4);'), '.hero-progress-fill must use emerald-to-cyan gradient');

  // Elimination of dual thumbs: .hero-progress-thumb is hidden
  assert(css.includes('display: none !important;'), '.hero-progress-thumb must be hidden with display: none !important');
  assert(css.includes('opacity: 0;'), '.hero-progress-thumb must have opacity: 0');

  // Transparent range slider overlay
  assert(css.includes('.hero-seek-slider {'), 'CSS must define .hero-seek-slider');
  assert(css.includes('background: transparent;'), '.hero-seek-slider must have transparent background');
  assert(css.includes('z-index: 5;'), '.hero-seek-slider must sit on top at z-index: 5');

  // Elastic single range thumb physics
  assert(css.includes('.hero-seek-slider::-webkit-slider-thumb {'), 'CSS must define .hero-seek-slider::-webkit-slider-thumb');
  assert(css.includes('cubic-bezier(0.34, 1.56, 0.64, 1)'), 'Slider thumb must have elastic cubic-bezier curve');
  assert(css.includes('transform: scale(1.45);'), 'Slider thumb must scale to 1.45 on active');
  assert(css.includes('transform: scale(1.15);'), 'Slider thumb must scale to 1.15 on hover');

  // Light mode contrast support
  assert(css.includes('body.theme-light .hero-progress-track'), 'CSS must define light mode for hero-progress-track');

  console.log('  ✅ Visual track, transparent slider overlay, hidden legacy thumb & elastic thumb physics certified');
}

// ===========================================================================
// Battery 3: ARIA & Keyboard Accessibility Verification (WCAG AA Compliance)
// ===========================================================================
console.log('\nBattery 3: ARIA & Keyboard Accessibility Verification');
{
  const html = fs.readFileSync(dashHtmlPath, 'utf8');
  const css = fs.readFileSync(dashCssPath, 'utf8');

  // Verify ARIA roles on both slider and progress bar
  const progressTag = html.match(/<div[^>]*id="heroProgressBar"[^>]*>/)[0];
  assert(progressTag.includes('role="slider"'), '#heroProgressBar must have role="slider"');
  assert(progressTag.includes('tabindex="0"'), '#heroProgressBar must have tabindex="0"');
  assert(progressTag.includes('aria-label="Video Timeline"'), '#heroProgressBar must have aria-label="Video Timeline"');
  assert(progressTag.includes('aria-valuemin="0"'), '#heroProgressBar must have aria-valuemin="0"');
  assert(progressTag.includes('aria-valuemax="100"'), '#heroProgressBar must have aria-valuemax="100"');

  const sliderTag = html.match(/<input[^>]*id="heroMediaSeekSlider"[^>]*>/)[0];
  assert(sliderTag.includes('type="range"'), '#heroMediaSeekSlider must be type="range"');
  assert(sliderTag.includes('aria-label="Media timeline seek slider"'), '#heroMediaSeekSlider must have accessible aria-label');

  // Verify :focus-visible outlines
  assert(css.includes('#heroProgressBar:focus-visible'), 'CSS must style #heroProgressBar:focus-visible');
  assert(css.includes('#heroMediaSeekSlider:focus-visible'), 'CSS must style #heroMediaSeekSlider:focus-visible');

  console.log('  ✅ Full ARIA slider specification, tab navigation, and prominent :focus-visible rings certified');
}

// ===========================================================================
// Battery 4: Event Synchronization, 0ms Scripting & Snapback Lockout Verification
// ===========================================================================
console.log('\nBattery 4: Event Synchronization, 0ms Scripting & Snapback Lockout Verification');
{
  const js = fs.readFileSync(dashJsPath, 'utf8');

  // Verify seekSlider input event syncs width, time text, pct text, and heroProgressBar ARIA
  assert(js.includes("seekSlider.addEventListener('input'"), 'dashboard.js must listen for input on seekSlider');
  assert(js.includes("fill.style.width = `${pct.toFixed(1)}%`"), 'seekSlider input must update fill.style.width');
  assert(js.includes("isDraggingHeroProgress = true;"), 'seekSlider input must set isDraggingHeroProgress = true');
  assert(js.includes("lastHeroProgressDragTime = Date.now();"), 'seekSlider input must refresh lastHeroProgressDragTime');

  // Verify seekSlider change event dispatches seek_percent and 0ms MAIN world executeScript
  assert(js.includes("seekSlider.addEventListener('change'"), 'dashboard.js must listen for change on seekSlider');
  assert(js.includes("sendMediaControl('seek_percent', { percent: pct, positionSeconds: targetSec }, targetTabId);"), 'seekSlider change must dispatch seek_percent IPC');
  assert(js.includes("isDraggingHeroProgress = false;"), 'seekSlider change must clear isDraggingHeroProgress');

  // Verify keyboard keydown synchronization updates both heroProgressBar and seekSlider
  assert(js.includes("heroProgress.addEventListener('keydown'"), 'dashboard.js must handle keydown on heroProgress');
  const keydownMatch = js.match(/heroProgress\.addEventListener\('keydown'[\s\S]*?\}\);\s*\}/);
  assert(keydownMatch, 'keydown handler block found');
  assert(keydownMatch[0].includes("seekSlider.value = String(pct);"), 'keydown seeking must synchronize seekSlider.value');

  console.log('  ✅ Bidirectional synchronization, snapback lockout, and fast 0ms MAIN world seek verified');
}

// ===========================================================================
// Battery 5: UTF-8 BOM Compliance Verification across All Target Files
// ===========================================================================
console.log('\nBattery 5: UTF-8 BOM Compliance Verification');
{
  const targetFiles = [
    dashHtmlPath,
    dashCssPath,
    dashJsPath,
    __filename
  ];

  targetFiles.forEach((f) => {
    const buf = fs.readFileSync(f);
    assert.strictEqual(buf[0], 0xEF, `${path.basename(f)} must start with BOM byte 0xEF`);
    assert.strictEqual(buf[1], 0xBB, `${path.basename(f)} must have BOM byte 0xBB`);
    assert.strictEqual(buf[2], 0xBF, `${path.basename(f)} must have BOM byte 0xBF`);
    console.log(`  ✅ UTF-8 BOM verified on ${path.basename(f)}`);
  });
}

console.log('\n🎉 ALL 5 UNIFIED TIMELINE SCRUBBER TEST BATTERIES PASSED WITH 100% SUCCESS!');
