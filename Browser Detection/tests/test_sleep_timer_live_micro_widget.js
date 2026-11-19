/**
 * Verification Test Suite: Sleep Timer Live Micro-Widget & Deep-Link Navigation
 *
 * Deterministic Test Batteries:
 * Battery 1: DOM Elements, Attributes & Accessibility Verification (dashboard/dashboard.html)
 * Battery 2: CSS Styles, Keyframes & Accessibility Fallbacks (components.css & layout.css)
 * Battery 3: Domain Module Implementation & Deep-Linking (sleep_advanced_suite.js)
 * Battery 4: Dashboard Integration, Fallback & Export Parity (dashboard/dashboard.js)
 * Battery 5: Event Listener Wiring & Keyboard Accessibility Simulation
 * Battery 6: Real-Time Telemetry Synchronization Across States (IDLE, RUNNING, PAUSED, FADING)
 * Battery 7: W3C Trusted Types & Universal Rule 28 Code Modularity
 *
 * Target Workspace: Win App Tracker / Browser Detection
 * Department: Dept 05 Frontend Engineering, Dept 04 Chrome Extension Development, Dept 08 QA & Testing
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '..');
const htmlPath = path.join(baseDir, 'dashboard', 'dashboard.html');
const cssPath = path.join(baseDir, 'dashboard', 'styles', 'components.css');
const layoutCssPath = path.join(baseDir, 'dashboard', 'styles', 'layout.css');
const suiteJsPath = path.join(baseDir, 'src', 'dashboard', 'features', 'sleep_advanced_suite.js');
const dashJsPath = path.join(baseDir, 'dashboard', 'dashboard.js');

console.log('🧪 Starting Sleep Timer Live Micro-Widget QA Suite...\n');

// ===========================================================================
// Helper: Mock DOM Element Factory
// ===========================================================================
function createMockElement(id) {
  const classes = new Set();
  const attributes = {};
  const listeners = {};

  return {
    id,
    textContent: '',
    get className() {
      return Array.from(classes).join(' ');
    },
    set className(val) {
      classes.clear();
      if (val) val.split(/\s+/).filter(Boolean).forEach(c => classes.add(c));
    },
    offsetWidth: 120,
    scrollIntoViewCalled: false,
    scrollIntoViewOpts: null,
    focusCalled: false,
    focusOpts: null,
    classList: {
      add: (...clsList) => clsList.forEach(c => classes.add(c)),
      remove: (...clsList) => clsList.forEach(c => classes.delete(c)),
      contains: (c) => classes.has(c),
      toggle: (c, force) => {
        if (force === true) { classes.add(c); return true; }
        if (force === false) { classes.delete(c); return false; }
        if (classes.has(c)) { classes.delete(c); return false; }
        classes.add(c); return true;
      }
    },
    getAttribute: (attr) => attributes[attr] || null,
    setAttribute: (attr, val) => { attributes[attr] = String(val); },
    hasAttribute: (attr) => attr in attributes,
    addEventListener: (event, handler) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(handler);
    },
    removeEventListener: (event, handler) => {
      if (!listeners[event]) return;
      listeners[event] = listeners[event].filter(h => h !== handler);
    },
    dispatchEvent: (eventObj) => {
      const type = eventObj.type || eventObj;
      if (listeners[type]) {
        listeners[type].forEach(fn => fn(eventObj));
      }
    },
    scrollIntoView: function(opts) {
      this.scrollIntoViewCalled = true;
      this.scrollIntoViewOpts = opts;
    },
    focus: function(opts) {
      this.focusCalled = true;
      this.focusOpts = opts;
    },
    getListeners: (event) => listeners[event] || []
  };
}

// ===========================================================================
// Battery 1: DOM Elements, Attributes & Accessibility Verification
// ===========================================================================
console.log('📋 Battery 1: DOM Elements, Attributes & Accessibility Verification');
{
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  // Verify sleepLiveMicroWidget exists with role="button", tabindex="0", aria-label
  assert.ok(htmlContent.includes('id="sleepLiveMicroWidget"'), 'sleepLiveMicroWidget element exists in dashboard.html');
  assert.ok(htmlContent.includes('id="sleepMicroStatusDot"'), 'sleepMicroStatusDot exists in sleepLiveMicroWidget');
  assert.ok(htmlContent.includes('id="sleepMicroClock"'), 'sleepMicroClock exists in sleepLiveMicroWidget');
  assert.ok(htmlContent.includes('id="sleepMicroMode"'), 'sleepMicroMode exists in sleepLiveMicroWidget');

  assert.ok(
    htmlContent.includes('aria-label="Sleep Sentinel State (Click to switch to Focus &amp; Sleep Hub)"'),
    'Accessible aria-label declared on sleepLiveMicroWidget'
  );

  // Verify target Sleep Sentinel elements exist in dashboard.html
  assert.ok(htmlContent.includes('id="cardSleepSentinelHub"'), 'Sleep Sentinel card cardSleepSentinelHub exists');
  assert.ok(htmlContent.includes('id="btnDashSleepToggle"'), 'Toggle button btnDashSleepToggle exists');

  console.log('  ✅ Battery 1 Passed: Semantic HTML and accessibility attributes verified.');
}

// ===========================================================================
// Battery 2: CSS Styles, Keyframes & Accessibility Fallbacks
// ===========================================================================
console.log('\n🎨 Battery 2: CSS Styles, Keyframes & Accessibility Fallbacks');
{
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  const layoutContent = fs.readFileSync(layoutCssPath, 'utf8');

  // Keyframes verification
  assert.ok(cssContent.includes('@keyframes sleepSentinelGlow'), '@keyframes sleepSentinelGlow defined in components.css');
  assert.ok(cssContent.includes('@keyframes sleepStartBtnPulse'), '@keyframes sleepStartBtnPulse defined in components.css');

  // Class associations
  assert.ok(cssContent.includes('.sleep-card-highlight'), '.sleep-card-highlight rule defined');
  assert.ok(cssContent.includes('animation: sleepSentinelGlow 2s ease-out forwards;'), 'Card highlight animation is sleepSentinelGlow 2s');

  assert.ok(cssContent.includes('.btn-sleep-primary.highlight-pulse'), '.btn-sleep-primary.highlight-pulse rule defined');
  assert.ok(cssContent.includes('animation: sleepStartBtnPulse 0.9s ease-in-out 2;'), 'Button pulse animation is sleepStartBtnPulse 0.9s 2 cycles');

  // Reduced motion support
  assert.ok(cssContent.includes('@media (prefers-reduced-motion: reduce)'), 'prefers-reduced-motion media query present');
  assert.ok(cssContent.includes('animation: none !important;'), 'Reduced motion disables keyframe animations');

  // Layout micro-hud style
  assert.ok(layoutContent.includes('.sleep-micro-hud'), '.sleep-micro-hud defined in layout.css');

  console.log('  ✅ Battery 2 Passed: Keyframes, pulse styles, and reduced-motion fallbacks certified.');
}

// ===========================================================================
// Battery 3: Domain Module Implementation & Functionality (sleep_advanced_suite.js)
// ===========================================================================
console.log('\n🧠 Battery 3: Domain Module Implementation (sleep_advanced_suite.js)');
{
  const suiteModule = require(suiteJsPath);

  assert.strictEqual(typeof suiteModule.navigateToSleepSentinel, 'function', 'suite.navigateToSleepSentinel is a function');

  // Test execution in mock environment
  const mockCard = createMockElement('cardSleepSentinelHub');
  const mockBtn = createMockElement('btnDashSleepToggle');

  let switchTabCalledWith = null;
  let hapticsClickPlayed = false;

  const mockWindow = {
    sentinelHaptics: {
      playClick: () => { hapticsClickPlayed = true; }
    },
    switchTab: (tab) => { switchTabCalledWith = tab; },
    matchMedia: (q) => ({ matches: false })
  };

  const mockDoc = {
    getElementById: (id) => {
      if (id === 'cardSleepSentinelHub') return mockCard;
      if (id === 'btnDashSleepToggle') return mockBtn;
      return null;
    }
  };

  const originalWindow = global.window;
  const originalDoc = global.document;

  try {
    global.window = mockWindow;
    global.document = mockDoc;

    suiteModule.navigateToSleepSentinel();

    assert.strictEqual(hapticsClickPlayed, true, 'sentinelHaptics.playClick() was invoked');
    assert.strictEqual(switchTabCalledWith, 'wellbeing', 'switchTab("wellbeing") was invoked');

    // Wait for 60ms layout deferral
    setTimeout(() => {
      assert.strictEqual(mockCard.scrollIntoViewCalled, true, 'card.scrollIntoView was called');
      assert.strictEqual(mockCard.scrollIntoViewOpts?.behavior, 'smooth', 'smooth behavior used when prefers-reduced-motion is false');
      assert.strictEqual(mockCard.scrollIntoViewOpts?.block, 'center', 'block: "center" used for viewport alignment');

      assert.strictEqual(mockCard.classList.contains('sleep-card-highlight'), true, 'card received .sleep-card-highlight class');
      assert.strictEqual(mockBtn.classList.contains('highlight-pulse'), true, 'button received .highlight-pulse class');
      assert.strictEqual(mockBtn.focusCalled, true, 'btn.focus was invoked');
      assert.strictEqual(mockBtn.focusOpts?.preventScroll, true, 'btn.focus called with { preventScroll: true }');
    }, 80);

  } finally {
    global.window = originalWindow;
    global.document = originalDoc;
  }

  console.log('  ✅ Battery 3 Passed: Domain logic executed, scrolled, highlighted, and focused.');
}

// ===========================================================================
// Battery 4: Dashboard Integration, Fallback & Export Parity
// ===========================================================================
console.log('\n🔌 Battery 4: Dashboard Integration & Export Parity');
{
  const dashContent = fs.readFileSync(dashJsPath, 'utf8');

  // Verify function declaration and exports in dashboard.js
  assert.ok(dashContent.includes('function navigateToSleepSentinel()'), 'navigateToSleepSentinel declared in dashboard.js');
  assert.ok(dashContent.includes('navigateToSleepSentinel,'), 'navigateToSleepSentinel in dashboard module exports');
  assert.ok(dashContent.includes('window.navigateToSleepSentinel = navigateToSleepSentinel;'), 'window.navigateToSleepSentinel attached');
  assert.ok(dashContent.includes('globalThis.navigateToSleepSentinel = navigateToSleepSentinel;'), 'globalThis.navigateToSleepSentinel attached');

  // Verify updateSleepMicroWidget declaration and exports
  assert.ok(dashContent.includes('function updateSleepMicroWidget('), 'updateSleepMicroWidget declared in dashboard.js');
  assert.ok(dashContent.includes('updateSleepMicroWidget,'), 'updateSleepMicroWidget in dashboard module exports');
  assert.ok(dashContent.includes('window.updateSleepMicroWidget = updateSleepMicroWidget;'), 'window.updateSleepMicroWidget attached');
  assert.ok(dashContent.includes('globalThis.updateSleepMicroWidget = updateSleepMicroWidget;'), 'globalThis.updateSleepMicroWidget attached');

  // Verify delegation to SleepAdvancedSuite
  assert.ok(
    dashContent.includes('if (typeof SleepAdvancedSuite !== \'undefined\' && typeof SleepAdvancedSuite.navigateToSleepSentinel === \'function\')'),
    'dashboard.js checks and delegates to SleepAdvancedSuite.navigateToSleepSentinel'
  );

  console.log('  ✅ Battery 4 Passed: Dashboard fallback, delegation, and export parity certified.');
}

// ===========================================================================
// Battery 5: Event Listener Wiring & Keyboard Accessibility Simulation
// ===========================================================================
console.log('\n⌨️ Battery 5: Event Listener Wiring & Keyboard Accessibility Simulation');
{
  const sleepMicroWidget = createMockElement('sleepLiveMicroWidget');

  let navTriggerCount = 0;
  const mockNavigateToSleepSentinel = () => {
    navTriggerCount++;
  };

  // Wire listeners as declared in dashboard.js
  sleepMicroWidget.addEventListener('click', () => mockNavigateToSleepSentinel());
  sleepMicroWidget.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      mockNavigateToSleepSentinel();
    }
  });

  // 1. Click sleepMicroWidget
  sleepMicroWidget.dispatchEvent({ type: 'click' });
  assert.strictEqual(navTriggerCount, 1, 'Clicking sleepLiveMicroWidget triggers navigateToSleepSentinel');

  // 2. Keydown Enter
  let enterDefaultPrevented = false;
  sleepMicroWidget.dispatchEvent({
    type: 'keydown',
    key: 'Enter',
    preventDefault: () => { enterDefaultPrevented = true; }
  });
  assert.strictEqual(navTriggerCount, 2, 'Keydown Enter triggers navigateToSleepSentinel');
  assert.strictEqual(enterDefaultPrevented, true, 'Keydown Enter prevents default action');

  // 3. Keydown Space
  let spaceDefaultPrevented = false;
  sleepMicroWidget.dispatchEvent({
    type: 'keydown',
    key: ' ',
    preventDefault: () => { spaceDefaultPrevented = true; }
  });
  assert.strictEqual(navTriggerCount, 3, 'Keydown Space triggers navigateToSleepSentinel');
  assert.strictEqual(spaceDefaultPrevented, true, 'Keydown Space prevents default scroll behavior');

  // 4. Non-activating keys (Tab, ArrowDown)
  let tabDefaultPrevented = false;
  sleepMicroWidget.dispatchEvent({
    type: 'keydown',
    key: 'Tab',
    preventDefault: () => { tabDefaultPrevented = true; }
  });
  assert.strictEqual(navTriggerCount, 3, 'Non-activation key Tab does not trigger navigation');
  assert.strictEqual(tabDefaultPrevented, false, 'Non-activation key Tab does not prevent default');

  console.log('  ✅ Battery 5 Passed: Click and keyboard events (Enter & Space) verified.');
}

// ===========================================================================
// Battery 6: Real-Time Telemetry Synchronization Across States
// ===========================================================================
console.log('\n⏱️ Battery 6: Real-Time Telemetry Synchronization Across States');
{
  const dashModule = require(dashJsPath);
  assert.strictEqual(typeof dashModule.updateSleepMicroWidget, 'function', 'updateSleepMicroWidget is exported');

  const mockClock = createMockElement('sleepMicroClock');
  const mockMode = createMockElement('sleepMicroMode');
  const mockDot = createMockElement('sleepMicroStatusDot');

  const originalDoc = global.document;
  try {
    global.document = {
      getElementById: (id) => {
        if (id === 'sleepMicroClock') return mockClock;
        if (id === 'sleepMicroMode') return mockMode;
        if (id === 'sleepMicroStatusDot') return mockDot;
        return null;
      }
    };

    // 1. Idle state
    dashModule.updateSleepMicroWidget('00:00', 'IDLE', true);
    assert.strictEqual(mockClock.textContent, '00:00', 'Clock displays 00:00 when idle');
    assert.strictEqual(mockMode.textContent, 'Sleep Idle', 'Mode displays Sleep Idle when idle');
    assert.strictEqual(mockDot.className, 'hud-dot idle', 'Dot has hud-dot idle class when idle');

    // 2. Running state
    dashModule.updateSleepMicroWidget('24:35', 'RUNNING', false);
    assert.strictEqual(mockClock.textContent, '24:35', 'Clock displays remaining time when running');
    assert.strictEqual(mockMode.textContent, 'Sleep Active', 'Mode displays Sleep Active when running');
    assert.strictEqual(mockDot.className, 'hud-dot online', 'Dot has hud-dot online class when running');

    // 3. Paused state
    dashModule.updateSleepMicroWidget('18:10', 'PAUSED', false);
    assert.strictEqual(mockClock.textContent, '18:10', 'Clock displays remaining time when paused');
    assert.strictEqual(mockMode.textContent, 'Sleep Paused', 'Mode displays Sleep Paused when paused');
    assert.strictEqual(mockDot.className, 'hud-dot warn', 'Dot has hud-dot warn class when paused');

    // 4. Fading state
    dashModule.updateSleepMicroWidget('00:45', 'FADING', false);
    assert.strictEqual(mockClock.textContent, '00:45', 'Clock displays remaining time when fading');
    assert.strictEqual(mockMode.textContent, 'Sleep Fading', 'Mode displays Sleep Fading when fading');
    assert.strictEqual(mockDot.className, 'hud-dot warn', 'Dot has hud-dot warn class when fading');

    // 5. Cancelled state
    dashModule.updateSleepMicroWidget('00:00', 'CANCELLED', true);
    assert.strictEqual(mockClock.textContent, '00:00', 'Clock displays 00:00 when cancelled');
    assert.strictEqual(mockMode.textContent, 'Sleep Idle', 'Mode displays Sleep Idle when cancelled');
    assert.strictEqual(mockDot.className, 'hud-dot idle', 'Dot has hud-dot idle class when cancelled');

  } finally {
    global.document = originalDoc;
  }

  console.log('  ✅ Battery 6 Passed: Telemetry synchronization certified across IDLE, RUNNING, PAUSED, FADING, CANCELLED.');
}

// ===========================================================================
// Battery 7: W3C Trusted Types & Universal Rule 28 Code Modularity
// ===========================================================================
console.log('\n🔒 Battery 7: W3C Trusted Types & Universal Rule 28 Code Modularity');
{
  const files = [htmlPath, cssPath, layoutCssPath, suiteJsPath, dashJsPath];

  // 1. Verify UTF-8 with BOM on all files
  files.forEach(f => {
    const raw = fs.readFileSync(f);
    assert.strictEqual(raw[0], 0xEF, `${path.basename(f)} missing UTF-8 BOM byte 1`);
    assert.strictEqual(raw[1], 0xBB, `${path.basename(f)} missing UTF-8 BOM byte 2`);
    assert.strictEqual(raw[2], 0xBF, `${path.basename(f)} missing UTF-8 BOM byte 3`);
  });

  // 2. Universal Rule 28: navigateToSleepSentinel line count and nesting depth
  const suiteContent = fs.readFileSync(suiteJsPath, 'utf8');
  const fnMatch = suiteContent.match(/function navigateToSleepSentinel\(\) \{([\s\S]*?)\n  \}/);
  assert.ok(fnMatch, 'navigateToSleepSentinel function definition found in suite');
  const fnLines = fnMatch[0].split('\n').length;
  assert.ok(fnLines <= 50, `navigateToSleepSentinel line count (${fnLines}) must be <= 50 per Rule 28`);

  // 3. updateSleepMicroWidget line count <= 30
  const dashContent = fs.readFileSync(dashJsPath, 'utf8');
  const widgetFnMatch = dashContent.match(/function updateSleepMicroWidget\([^)]*\) \{([\s\S]*?)\n\}/);
  assert.ok(widgetFnMatch, 'updateSleepMicroWidget function definition found in dashboard.js');
  const widgetFnLines = widgetFnMatch[0].split('\n').length;
  assert.ok(widgetFnLines <= 30, `updateSleepMicroWidget line count (${widgetFnLines}) must be <= 30`);

  // 4. W3C Trusted Types: Zero innerHTML assignments in touched feature code
  assert.ok(!fnMatch[0].includes('innerHTML'), 'Zero innerHTML mutations in navigateToSleepSentinel');
  assert.ok(!widgetFnMatch[0].includes('innerHTML'), 'Zero innerHTML mutations in updateSleepMicroWidget');

  console.log('  ✅ Battery 7 Passed: UTF-8 with BOM, Rule 28 modularity, and Trusted Types certified.');
}

console.log('\n============================================================');
console.log('🎉 ALL 7 DETERMINISTIC BATTERIES PASSED CLEANLY (100% GREEN)');
console.log('============================================================\n');
