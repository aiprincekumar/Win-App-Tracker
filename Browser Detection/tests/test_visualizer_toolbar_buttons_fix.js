/**
 * tests/test_visualizer_toolbar_buttons_fix.js
 * Verification Suite for Visualizer Toolbar Buttons Defect 1 & Defect 2 Fixes:
 * - Defect 1: Fullscreen Button 3-stage bug & decoupling from visualizer-theater-mode
 * - Defect 2: Full Window single-source binding, CSS coordinate trapping prevention, Escape key exit
 * 
 * UTF-8 with BOM (0xEF, 0xBB, 0xBF) Encoded
 */

'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting Visualizer Toolbar Buttons Defect 1 & Defect 2 Verification Suite...\n');

const rootDir = path.resolve(__dirname, '..');
const dashJsPath = path.join(rootDir, 'dashboard', 'dashboard.js');
const featureJsPath = path.join(rootDir, 'src', 'dashboard', 'features', 'media_deck_visualizer_feature.js');
const mediaCssPath = path.join(rootDir, 'dashboard', 'styles', 'media.css');
const dashCssPath = path.join(rootDir, 'dashboard', 'dashboard.css');

// =============================================================================
// Test 1: UTF-8 with BOM Standard Audit
// =============================================================================
console.log('Test 1: UTF-8 with BOM (0xEF, 0xBB, 0xBF) Standard Audit');
{
  function hasBOM(filePath) {
    const buf = fs.readFileSync(filePath);
    return buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF;
  }

  assert(hasBOM(dashJsPath), 'dashboard.js must be UTF-8 with BOM');
  assert(hasBOM(featureJsPath), 'media_deck_visualizer_feature.js must be UTF-8 with BOM');
  assert(hasBOM(mediaCssPath), 'media.css must be UTF-8 with BOM');
  assert(hasBOM(dashCssPath), 'dashboard.css must be UTF-8 with BOM');
  console.log('  ✅ All modified files certified UTF-8 BOM standard');
}

// =============================================================================
// Test 2: CSS Coordinate Trapping Prevention & Viewport Fill Engine
// =============================================================================
console.log('\nTest 2: CSS Coordinate Trapping Prevention & Viewport Fill Engine');
{
  const mediaCss = fs.readFileSync(mediaCssPath, 'utf8');
  const dashCss = fs.readFileSync(dashCssPath, 'utf8');

  [mediaCss, dashCss].forEach((css, idx) => {
    const name = idx === 0 ? 'media.css' : 'dashboard.css';

    // Must declare dedicated fullscreen class
    assert(css.includes('#heroAudioLabStatus.visualizer-fullscreen-mode'), `${name} must declare #heroAudioLabStatus.visualizer-fullscreen-mode`);
    assert(css.includes('#heroAudioLabStatus.visualizer-theater-mode'), `${name} must declare #heroAudioLabStatus.visualizer-theater-mode`);

    // Must have transform: none !important to prevent coordinate trapping
    assert(css.includes('transform: none !important;'), `${name} must have transform: none !important;`);
    assert(css.includes('animation: none !important;'), `${name} must have animation: none !important;`);

    // Hover selector must neutralize translateY
    assert(css.includes('#heroAudioLabStatus.visualizer-theater-mode:hover'), `${name} must declare #heroAudioLabStatus.visualizer-theater-mode:hover`);
    assert(css.includes('#heroAudioLabStatus.visualizer-fullscreen-mode:hover'), `${name} must declare #heroAudioLabStatus.visualizer-fullscreen-mode:hover`);

    // Viewport fill tokens
    assert(css.includes('position: fixed !important;'), `${name} must have position: fixed !important;`);
    assert(css.includes('inset: 0 !important;'), `${name} must have inset: 0 !important;`);
    assert(css.includes('width: 100vw !important;'), `${name} must have width: 100vw !important;`);
    assert(css.includes('height: 100vh !important;'), `${name} must have height: 100vh !important;`);
    assert(css.includes('z-index: 999999 !important;'), `${name} must have z-index: 999999 !important;`);

    // Body classes
    assert(css.includes('body.visualizer-theater-active'), `${name} must declare body.visualizer-theater-active`);
    assert(css.includes('body.visualizer-fullscreen-active'), `${name} must declare body.visualizer-fullscreen-active`);
  });
  console.log('  ✅ CSS transform: none !important and animation: none !important verified in media.css and dashboard.css');
  console.log('  ✅ Viewport fill tokens (100vw, 100vh, fixed, inset:0, z-index: 999999) verified in both stylesheets');
  console.log('  ✅ Stacking context coordinate trapping neutralized on hover');
}

// =============================================================================
// Test 3: Defect 1 - Fullscreen Class Decoupling & Clean Exit to Normal Mode
// =============================================================================
console.log('\nTest 3: Defect 1 - Fullscreen Class Decoupling & Clean Exit to Normal Mode');
{
  const feature = require(featureJsPath);

  function createMockElement(id, initialClasses = []) {
    const classSet = new Set(initialClasses);
    const attrs = {};
    const listeners = {};
    return {
      id,
      classList: {
        add: (...cls) => cls.forEach(c => classSet.add(c)),
        remove: (...cls) => cls.forEach(c => classSet.delete(c)),
        contains: (c) => classSet.has(c),
        get value() { return Array.from(classSet).join(' '); }
      },
      setAttribute: (k, v) => { attrs[k] = String(v); },
      getAttribute: (k) => attrs[k] || null,
      querySelector: (sel) => {
        if (sel === '.viz-icon-expand') return createMockElement('iconExpand');
        if (sel === '.viz-icon-compress') return createMockElement('iconCompress', ['visually-hidden']);
        return null;
      },
      addEventListener: (type, fn) => {
        if (!listeners[type]) listeners[type] = [];
        listeners[type].push(fn);
      },
      dispatchMockEvent: (type, evObj) => {
        if (listeners[type]) {
          listeners[type].forEach(fn => fn(evObj || { preventDefault: () => {} }));
        }
      },
      requestFullscreen: function() { return Promise.resolve(); }
    };
  }

  const mockCard = createMockElement('heroAudioLabStatus');
  const mockBtnFw = createMockElement('btnVizFullWindow');
  const mockBtnFs = createMockElement('btnVizFullscreen');
  const mockBtnVideo = createMockElement('btnVizVideoEmbedToggle');
  const mockCtx = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    fillRect: () => {},
    clearRect: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    stroke: () => {},
    fill: () => {},
    arc: () => {},
    roundRect: () => {},
    createLinearGradient: () => ({ addColorStop: () => {} })
  };

  const mockCanvas = {
    width: 600,
    height: 120,
    parentElement: { getBoundingClientRect: () => ({ width: 1400, height: 600 }) },
    getContext: () => mockCtx,
    dataset: {}
  };

  const docListeners = {};
  const mockDoc = {
    body: createMockElement('body'),
    fullscreenElement: null,
    getElementById: (id) => {
      if (id === 'heroAudioLabStatus') return mockCard;
      if (id === 'btnVizFullWindow') return mockBtnFw;
      if (id === 'btnVizFullscreen') return mockBtnFs;
      if (id === 'btnVizVideoEmbedToggle') return mockBtnVideo;
      if (id === 'canvasAudioVisualizer') return mockCanvas;
      return null;
    },
    querySelector: (sel) => {
      if (sel === '.visualizer-canvas-container') return mockCard;
      return null;
    },
    addEventListener: (type, fn) => {
      if (!docListeners[type]) docListeners[type] = [];
      docListeners[type].push(fn);
    },
    dispatchMockDocEvent: (type) => {
      if (docListeners[type]) {
        docListeners[type].forEach(fn => fn());
      }
    },
    exitFullscreen: function() {
      mockDoc.fullscreenElement = null;
      return Promise.resolve();
    }
  };

  feature.initAudioVisualizer(mockCanvas, { doc: mockDoc });

  // 3.1: Enter Fullscreen: verifies visualizer-fullscreen-mode is added, NOT visualizer-theater-mode
  feature.setVisualizerFullscreenState(true, { doc: mockDoc });
  assert.strictEqual(feature.isVisualizerFullscreenActive(), true, 'Fullscreen state must be true');
  assert.strictEqual(feature.isVisualizerFullWindowActive(), false, 'Full Window state must be false in Fullscreen');
  assert(mockCard.classList.contains('visualizer-fullscreen-mode'), 'Card must have visualizer-fullscreen-mode');
  assert(!mockCard.classList.contains('visualizer-theater-mode'), 'Card MUST NOT have visualizer-theater-mode in Fullscreen');
  assert(mockDoc.body.classList.contains('visualizer-fullscreen-active'), 'Body must have visualizer-fullscreen-active');
  assert(!mockDoc.body.classList.contains('visualizer-theater-active'), 'Body MUST NOT have visualizer-theater-active');
  console.log('  ✅ 3.1: Entering Fullscreen uses .visualizer-fullscreen-mode without contaminating .visualizer-theater-mode');

  // 3.2: Exit Fullscreen: verifies return to Normal (Mini) mode with zero residual theater classes
  feature.setVisualizerFullscreenState(false, { doc: mockDoc });
  assert.strictEqual(feature.isVisualizerFullscreenActive(), false, 'Fullscreen state must be false');
  assert.strictEqual(feature.isVisualizerFullWindowActive(), false, 'Full Window state must be false on exit');
  assert(!mockCard.classList.contains('visualizer-fullscreen-mode'), 'visualizer-fullscreen-mode removed');
  assert(!mockCard.classList.contains('visualizer-theater-mode'), 'visualizer-theater-mode must be absent (clean Mini mode)');
  assert(!mockDoc.body.classList.contains('visualizer-fullscreen-active'), 'visualizer-fullscreen-active removed from body');
  assert(!mockDoc.body.classList.contains('visualizer-theater-active'), 'visualizer-theater-active must be absent from body');
  assert.strictEqual(mockCanvas.width, 600, 'Canvas width restored to 600 baseline');
  assert.strictEqual(mockCanvas.height, 120, 'Canvas height restored to 120 baseline');
  console.log('  ✅ 3.2: Exiting Fullscreen cleanly restores Normal (Mini) mode with zero residual theater mode');

  // 3.3: Native fullscreenchange exit event cleans up unconditionally
  mockDoc.fullscreenElement = mockCard;
  mockDoc.dispatchMockDocEvent('fullscreenchange');
  assert.strictEqual(feature.isVisualizerFullscreenActive(), true);
  assert(mockCard.classList.contains('visualizer-fullscreen-mode'));

  mockDoc.fullscreenElement = null;
  mockDoc.dispatchMockDocEvent('fullscreenchange');
  assert.strictEqual(feature.isVisualizerFullscreenActive(), false);
  assert(!mockCard.classList.contains('visualizer-fullscreen-mode'));
  assert(!mockCard.classList.contains('visualizer-theater-mode'));
  console.log('  ✅ 3.3: Native fullscreenchange exit unconditionally removes both fullscreen and theater classes');
}

// =============================================================================
// Test 4: Defect 2 - Full Window Single-Source Binding & Toggle Verification
// =============================================================================
console.log('\nTest 4: Defect 2 - Full Window Single-Source Binding & Toggle Verification');
{
  const dashCode = fs.readFileSync(dashJsPath, 'utf8');

  // Verify single-source binding guard in dashboard.js
  assert(dashCode.includes('btnVizFullWindow && !btnVizFullWindow.__vizBound'), 'dashboard.js must guard btnVizFullWindow binding with !__vizBound');
  assert(dashCode.includes('btnVizFullscreen && !btnVizFullscreen.__vizBound'), 'dashboard.js must guard btnVizFullscreen binding with !__vizBound');
  assert(dashCode.includes('btnVizVideoEmbedToggle && !btnVizVideoEmbedToggle.__vizBound'), 'dashboard.js must guard btnVizVideoEmbedToggle binding with !__vizBound');
  console.log('  ✅ 4.1: dashboard.js guards all 3 action buttons with !__vizBound to eliminate duplicate listener registration');

  // Verify Escape key prioritization: fullscreen checked BEFORE full window
  const escIndex = dashCode.indexOf("if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27)");
  assert(escIndex !== -1, 'dashboard.js must contain visualizer Escape key handler');
  const escBlock = dashCode.substring(escIndex, escIndex + 600);
  const fsPos = escBlock.indexOf('isVisualizerFullscreenActive()');
  const fwPos = escBlock.indexOf('isVisualizerFullWindowActive()');
  assert(fsPos !== -1, 'Escape block must check isVisualizerFullscreenActive()');
  assert(fwPos !== -1, 'Escape block must check isVisualizerFullWindowActive()');
  assert(fsPos < fwPos, 'Escape block MUST check isVisualizerFullscreenActive() BEFORE isVisualizerFullWindowActive()');
  console.log('  ✅ 4.2: Escape key handler prioritizes exiting Fullscreen before checking Full Window');

  // Verify fullscreenchange listener does not have flawed theater mode guard
  const fsChangeIndex = dashCode.indexOf("['fullscreenchange', 'webkitfullscreenchange'");
  assert(fsChangeIndex !== -1, 'fullscreenchange handlers registered');
  const fsChangeBlock = dashCode.substring(fsChangeIndex, fsChangeIndex + 800);
  assert(!fsChangeBlock.includes('!card.classList.contains(\'visualizer-theater-mode\')'), 'Flawed visualizer-theater-mode guard must be removed from fullscreenchange');
  assert(fsChangeBlock.includes('if (!isNowNative)'), 'fullscreenchange must check !isNowNative directly');
  assert(fsChangeBlock.includes('syncFullscreenUI(false)'), 'fullscreenchange must call syncFullscreenUI(false) on exit');
  console.log('  ✅ 4.3: fullscreenchange listener cleanly calls syncFullscreenUI(false) without flawed theater guard');
}

// =============================================================================
// Test 5: AST Parsing & Syntax Verification
// =============================================================================
console.log('\nTest 5: AST Parsing & Syntax Verification');
{
  const vm = require('vm');
  const dashCode = fs.readFileSync(dashJsPath, 'utf8');
  const featureCode = fs.readFileSync(featureJsPath, 'utf8');

  new vm.Script(dashCode, { filename: 'dashboard.js' });
  new vm.Script(featureCode, { filename: 'media_deck_visualizer_feature.js' });
  console.log('  ✅ dashboard.js and media_deck_visualizer_feature.js parsed into VM scripts with 0 errors');
}

console.log('\n===========================================================================');
console.log('🎉 ALL 5 TESTS IN VISUALIZER TOOLBAR FIX SUITE PASSED (Exit Code 0)!');
console.log('===========================================================================\n');
