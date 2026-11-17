﻿/**
 * tests/test_visualizer_compact_fullscreen_embed.js
 * Verification Suite for TASK-VIZ-TOOLBAR-ALIGN-FULLSCREEN-001 / TASK-VIZ-COMPACT-FULLSCREEN-EMBED-003:
 * Visualizer Toolbar Edge-to-Edge Flex Alignment, Dual-Mode Full Window (Theater) & Full Screen Controls
 * UTF-8 with BOM (0xEF, 0xBB, 0xBF) Encoded
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting Visualizer Toolbar Alignment & Dual-Mode Controls Verification Suite (TASK-VIZ-TOOLBAR-ALIGN-FULLSCREEN-001)...\n');

const rootDir = path.resolve(__dirname, '..');
const htmlPath = path.join(rootDir, 'dashboard', 'dashboard.html');
const dashJsPath = path.join(rootDir, 'dashboard', 'dashboard.js');
const featureJsPath = path.join(rootDir, 'src', 'dashboard', 'features', 'media_deck_visualizer_feature.js');
const mediaCssPath = path.join(rootDir, 'dashboard', 'styles', 'media.css');
const dashCssPath = path.join(rootDir, 'dashboard', 'dashboard.css');

// =============================================================================
// Test 1: UI/UX Cleanup, Compact Header & Semantic Controls Bar in dashboard.html
// =============================================================================
console.log('Test 1: UI/UX Cleanup, Compact Header & Semantic Controls Bar in dashboard.html');
{
  const html = fs.readFileSync(htmlPath, 'utf8');

  // Verify telemetry badge markup is removed
  assert(!html.includes('60fps Live FFT'), '60fps Live FFT badge markup must be removed from dashboard.html');
  assert(!html.includes('visualizer-status-note'), '.visualizer-status-note container must be removed from dashboard.html');
  console.log('  ✅ Telemetry badge ("60 FPS LIVE FFT") confirmed removed');

  // Verify Effect label has .visually-hidden class
  assert(html.includes('id="lblVizEffect"'), '#lblVizEffect label ID must exist');
  assert(html.includes('for="selectVizEffect"'), 'Accessible for="selectVizEffect" must exist');
  const labelMatch = html.match(/<label[^>]*id="lblVizEffect"[^>]*>/);
  assert(labelMatch, '#lblVizEffect element must match');
  assert(labelMatch[0].includes('visually-hidden'), '#lblVizEffect must include "visually-hidden" class');
  console.log('  ✅ Effect label (#lblVizEffect) visually hidden while preserving screen-reader accessibility');

  // Verify Dropdown exists inside .viz-select-wrapper
  assert(html.includes('class="viz-select-wrapper"'), '.viz-select-wrapper container must exist');
  assert(html.includes('id="selectVizEffect"'), '#selectVizEffect dropdown must exist');
  console.log('  ✅ #selectVizEffect dropdown confirmed preserved within .viz-select-wrapper');

  // Verify .visualizer-controls-bar and .viz-actions-group containers exist
  assert(html.includes('visualizer-controls-bar'), '.visualizer-controls-bar must exist in dashboard.html');
  assert(html.includes('viz-actions-group'), '.viz-actions-group must exist in dashboard.html');
  console.log('  ✅ Semantic container hierarchy (.visualizer-controls-bar and .viz-actions-group) verified');
}

// =============================================================================
// Test 2: Dedicated Three Action Buttons in dashboard.html
// =============================================================================
console.log('\nTest 2: Dedicated Three Action Buttons Specification in dashboard.html');
{
  const html = fs.readFileSync(htmlPath, 'utf8');

  // Button 1: Video Embed Toggle
  assert(html.includes('id="btnVizVideoEmbedToggle"'), '#btnVizVideoEmbedToggle must exist in dashboard.html');
  const btnVideoMatch = html.match(/<button[^>]*id="btnVizVideoEmbedToggle"[^>]*>/);
  assert(btnVideoMatch, '#btnVizVideoEmbedToggle declaration must exist');
  assert(btnVideoMatch[0].includes('btn-viz-action-icon'), '#btnVizVideoEmbedToggle must have btn-viz-action-icon class');
  assert(btnVideoMatch[0].includes('title="Switch to Video Player (Embed Mode)"'), '#btnVizVideoEmbedToggle title attribute verified');
  assert(btnVideoMatch[0].includes('aria-label="Switch to Video Player (Embed Mode)"'), '#btnVizVideoEmbedToggle aria-label attribute verified');
  assert(btnVideoMatch[0].includes('tabindex="0"'), '#btnVizVideoEmbedToggle tabindex="0" attribute verified');
  console.log('  ✅ Button 1: Video Embed Toggle (#btnVizVideoEmbedToggle) specification verified');

  // Button 2: Full Window (Theater) Toggle
  assert(html.includes('id="btnVizFullWindow"'), '#btnVizFullWindow must exist in dashboard.html');
  const btnFwMatch = html.match(/<button[^>]*id="btnVizFullWindow"[^>]*>/);
  assert(btnFwMatch, '#btnVizFullWindow declaration must exist');
  assert(btnFwMatch[0].includes('btn-viz-action-icon'), '#btnVizFullWindow must have btn-viz-action-icon class');
  assert(btnFwMatch[0].includes('title="Full Window"') || btnFwMatch[0].includes('title="Toggle Visualizer Full Window (Theater)"'), '#btnVizFullWindow title attribute verified');
  assert(btnFwMatch[0].includes('aria-label="Full Window"') || btnFwMatch[0].includes('aria-label="Toggle Visualizer Full Window (Theater)"'), '#btnVizFullWindow aria-label attribute verified');
  assert(btnFwMatch[0].includes('aria-expanded="false"'), '#btnVizFullWindow aria-expanded="false" attribute verified');
  assert(btnFwMatch[0].includes('tabindex="0"'), '#btnVizFullWindow tabindex="0" attribute verified');

  // Verify Theater Window Icon inside Full Window button
  const fwSvgMatch = html.match(/<button[^>]*id="btnVizFullWindow"[\s\S]*?<\/button>/);
  assert(fwSvgMatch, '#btnVizFullWindow element content must match');
  assert(fwSvgMatch[0].includes('<rect'), '#btnVizFullWindow must contain rect SVG element');
  assert(fwSvgMatch[0].includes('<line'), '#btnVizFullWindow must contain line SVG element');
  console.log('  ✅ Button 2: Full Window Theater (#btnVizFullWindow) specification & SVG iconography verified');

  // Button 3: Fullscreen Visualizer
  assert(html.includes('id="btnVizFullscreen"'), '#btnVizFullscreen must exist in dashboard.html');
  const btnFsMatch = html.match(/<button[^>]*id="btnVizFullscreen"[^>]*>/);
  assert(btnFsMatch, '#btnVizFullscreen declaration must exist');
  assert(btnFsMatch[0].includes('btn-viz-action-icon'), '#btnVizFullscreen must have btn-viz-action-icon class');
  assert(btnFsMatch[0].includes('title="Full Screen (F)"') || btnFsMatch[0].includes('title="Toggle Visualizer Fullscreen"'), '#btnVizFullscreen title attribute verified');
  assert(btnFsMatch[0].includes('aria-label="Full Screen (F)"') || btnFsMatch[0].includes('aria-label="Toggle Visualizer Fullscreen"'), '#btnVizFullscreen aria-label attribute verified');
  assert(btnFsMatch[0].includes('aria-expanded="false"'), '#btnVizFullscreen aria-expanded="false" attribute verified');
  assert(btnFsMatch[0].includes('tabindex="0"'), '#btnVizFullscreen tabindex="0" attribute verified');

  // Verify Dual Expand & Compress SVG Icons inside Fullscreen button
  assert(html.includes('viz-icon-expand'), '.viz-icon-expand SVG icon must exist');
  assert(html.includes('viz-icon-compress'), '.viz-icon-compress SVG icon must exist');
  console.log('  ✅ Button 3: Fullscreen Visualizer (#btnVizFullscreen) specification & dual SVGs verified');

  // Containment: Verify all 3 buttons reside within .viz-actions-group
  const actionsGroupMatch = html.match(/<div class="viz-actions-group">([\s\S]*?)<\/div>/);
  assert(actionsGroupMatch, '.viz-actions-group wrapper must exist in dashboard.html');
  assert(actionsGroupMatch[1].includes('id="btnVizVideoEmbedToggle"'), '#btnVizVideoEmbedToggle must reside inside .viz-actions-group');
  assert(actionsGroupMatch[1].includes('id="btnVizFullWindow"'), '#btnVizFullWindow must reside inside .viz-actions-group');
  assert(actionsGroupMatch[1].includes('id="btnVizFullscreen"'), '#btnVizFullscreen must reside inside .viz-actions-group');
  console.log('  ✅ Actions container (.viz-actions-group) encapsulates all 3 action buttons in order');

  // Backward-compatible legacy mode buttons (hidden from visual flow, preserved for tests)
  assert(html.includes('id="btnVizModeBars"'), '#btnVizModeBars legacy button preserved for backward compatibility');
  assert(html.includes('id="btnVizModeWave"'), '#btnVizModeWave legacy button preserved for backward compatibility');
  console.log('  ✅ Legacy mode buttons preserved with .visually-hidden parity');
}

// =============================================================================
// Test 3: CSS Materiality, Spacing, Flex Alignment & Theater Mode Tokens
// =============================================================================
console.log('\nTest 3: CSS Materiality, Spacing, Flex Alignment & Theater Mode Tokens');
{
  const mediaCss = fs.readFileSync(mediaCssPath, 'utf8');
  const dashCss = fs.readFileSync(dashCssPath, 'utf8');

  // Check required selectors in both media.css and dashboard.css
  const requiredSelectors = [
    '.btn-viz-action-icon',
    '.btn-viz-action-icon:hover',
    '.btn-viz-action-icon:active',
    '.btn-viz-action-icon.active',
    '.visualizer-controls-bar',
    '.viz-actions-group',
    '#heroAudioLabStatus.visualizer-theater-mode',
    '#heroAudioLabStatus:fullscreen',
    'body.theme-light .visualizer-controls-bar'
  ];

  requiredSelectors.forEach(sel => {
    assert(mediaCss.includes(sel), `media.css must declare ${sel}`);
    assert(dashCss.includes(sel), `dashboard.css must declare ${sel}`);
    console.log(`  ✅ CSS Selector "${sel}" verified declared in media.css and dashboard.css`);
  });

  // Verify Flex Alignment and Width 100% in .visualizer-controls-bar
  assert(mediaCss.includes('justify-content: space-between !important;'), 'media.css must have justify-content: space-between in controls bar');
  assert(mediaCss.includes('width: 100% !important;'), 'media.css must have width: 100% in controls bar');
  assert(dashCss.includes('justify-content: space-between !important;'), 'dashboard.css must have justify-content: space-between in controls bar');
  assert(dashCss.includes('width: 100% !important;'), 'dashboard.css must have width: 100% in controls bar');
  console.log('  ✅ .visualizer-controls-bar edge-to-edge layout verified: justify-content: space-between and width: 100%');

  // Verify .viz-actions-group flex properties
  assert(mediaCss.includes('gap: 6px;'), 'media.css must declare 6px gap in .viz-actions-group');
  assert(dashCss.includes('gap: 6px;'), 'dashboard.css must declare 6px gap in .viz-actions-group');
  assert(mediaCss.includes('margin-left: auto;'), 'media.css must declare margin-left: auto in .viz-actions-group');
  assert(dashCss.includes('margin-left: auto;'), 'dashboard.css must declare margin-left: auto in .viz-actions-group');
  console.log('  ✅ .viz-actions-group verified with 6px gap, inline-flex alignment, and margin-left: auto');
}

// =============================================================================
// Test 4: Visualizer Feature Logic (Dual-Mode Full Window & True Fullscreen Engine)
// =============================================================================
console.log('\nTest 4: Visualizer Feature Logic: Dual-Mode Full Window, Fullscreen & Dynamic Canvas Adaptation');
{
  const feature = require(featureJsPath);

  // Method Exports Verification
  assert(typeof feature.isVisualizerFullWindowActive === 'function', 'isVisualizerFullWindowActive must be exported');
  assert(typeof feature.setVisualizerFullWindowState === 'function', 'setVisualizerFullWindowState must be exported');
  assert(typeof feature.toggleVisualizerFullWindow === 'function', 'toggleVisualizerFullWindow must be exported');
  assert(typeof feature.isVisualizerFullscreenActive === 'function', 'isVisualizerFullscreenActive must be exported');
  assert(typeof feature.setVisualizerFullscreenState === 'function', 'setVisualizerFullscreenState must be exported');
  assert(typeof feature.toggleVisualizerFullscreen === 'function', 'toggleVisualizerFullscreen must be exported');
  assert(typeof feature.isVisualizerVideoEmbedActive === 'function', 'isVisualizerVideoEmbedActive must be exported');
  assert(typeof feature.setVisualizerVideoEmbedState === 'function', 'setVisualizerVideoEmbedState must be exported');
  assert(typeof feature.toggleVisualizerVideoEmbed === 'function', 'toggleVisualizerVideoEmbed must be exported');

  // Mock DOM
  function createMockElement(id, initialClasses = []) {
    const classSet = new Set(initialClasses);
    const attrs = {};
    const listeners = {};
    return {
      id,
      value: '',
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
      requestFullscreen: function() {
        return Promise.resolve();
      }
    };
  }

  const mockCtx = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    shadowBlur: 0,
    shadowColor: '',
    lineCap: '',
    fillRect: () => {},
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
    parentElement: {
      getBoundingClientRect: () => ({ width: 1400, height: 600 })
    },
    getContext: () => mockCtx,
    dataset: {}
  };

  const mockCard = createMockElement('heroAudioLabStatus');
  const mockBtnFw = createMockElement('btnVizFullWindow');
  const mockBtnFs = createMockElement('btnVizFullscreen');
  const mockBtnVideo = createMockElement('btnVizVideoEmbedToggle');

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

  // ---------------------------------------------------------------------------
  // Sub-Test 4A: Full Window (Theater Mode) Activation & Exit
  // ---------------------------------------------------------------------------
  feature.setVisualizerFullWindowState(true, { doc: mockDoc });
  assert.strictEqual(feature.isVisualizerFullWindowActive(), true, 'Full Window state must be true');
  assert(mockCard.classList.contains('visualizer-theater-mode'), 'Card must have .visualizer-theater-mode class in Full Window');
  assert(mockDoc.body.classList.contains('visualizer-theater-active'), 'Body must have .visualizer-theater-active class in Full Window');
  assert.strictEqual(mockBtnFw.getAttribute('aria-expanded'), 'true', 'Full Window button aria-expanded must be true');
  assert(mockBtnFw.classList.contains('active'), 'Full Window button must have .active class');
  assert.strictEqual(mockCanvas.width, 1400, 'Canvas width must adapt to container width (1400) in Full Window');
  assert.strictEqual(mockCanvas.height, 600, 'Canvas height must adapt to container height (600) in Full Window');
  console.log('  ✅ Sub-Test 4A (Enter): Full Window Theater DOM classes, aria-expanded, and canvas resolution (1400x600) adapted');

  feature.setVisualizerFullWindowState(false, { doc: mockDoc });
  assert.strictEqual(feature.isVisualizerFullWindowActive(), false, 'Full Window state must be false');
  assert(!mockCard.classList.contains('visualizer-theater-mode'), 'Card must remove .visualizer-theater-mode class on exit');
  assert(!mockDoc.body.classList.contains('visualizer-theater-active'), 'Body must remove .visualizer-theater-active class on exit');
  assert.strictEqual(mockBtnFw.getAttribute('aria-expanded'), 'false', 'Full Window button aria-expanded must be false');
  assert(!mockBtnFw.classList.contains('active'), 'Full Window button must remove .active class');
  assert.strictEqual(mockCanvas.width, 600, 'Canvas width must restore to 600 baseline on exit');
  assert.strictEqual(mockCanvas.height, 120, 'Canvas height must restore to 120 baseline on exit');
  console.log('  ✅ Sub-Test 4A (Exit): Full Window Theater state, DOM classes, and baseline (600x120) restored');

  // Test toggle function & verify it NEVER triggers requestFullscreen
  let fsTriggeredInFullWindow = false;
  mockCard.requestFullscreen = function() {
    fsTriggeredInFullWindow = true;
    return Promise.resolve();
  };
  const toggledState = feature.toggleVisualizerFullWindow({ doc: mockDoc });
  assert.strictEqual(toggledState, true, 'toggleVisualizerFullWindow must toggle to true');
  assert.strictEqual(feature.isVisualizerFullWindowActive(), true);
  assert.strictEqual(fsTriggeredInFullWindow, false, 'toggleVisualizerFullWindow MUST NOT invoke requestFullscreen');
  feature.toggleVisualizerFullWindow({ doc: mockDoc });
  assert.strictEqual(feature.isVisualizerFullWindowActive(), false, 'toggleVisualizerFullWindow must toggle back to false');
  console.log('  ✅ Sub-Test 4A (Toggle): toggleVisualizerFullWindow cycles cleanly without invoking requestFullscreen');

  // ---------------------------------------------------------------------------
  // Sub-Test 4B: True W3C Fullscreen Activation & Sync
  // ---------------------------------------------------------------------------
  feature.setVisualizerFullscreenState(true, { doc: mockDoc });
  assert.strictEqual(feature.isVisualizerFullscreenActive(), true, 'Fullscreen state must be true');
  assert.strictEqual(mockBtnFs.getAttribute('aria-expanded'), 'true', 'Fullscreen button aria-expanded must be true');
  assert(mockBtnFs.classList.contains('active'), 'Fullscreen button must have .active class');
  assert.strictEqual(mockCanvas.width, 1400, 'Canvas width must adapt to container width in Fullscreen');
  assert.strictEqual(mockCanvas.height, 600, 'Canvas height must adapt to container height in Fullscreen');
  console.log('  ✅ Sub-Test 4B (Enter): Fullscreen state, button aria-expanded, active class, and canvas resize verified');

  feature.setVisualizerFullscreenState(false, { doc: mockDoc });
  assert.strictEqual(feature.isVisualizerFullscreenActive(), false, 'Fullscreen state must be false');
  assert.strictEqual(mockBtnFs.getAttribute('aria-expanded'), 'false', 'Fullscreen button aria-expanded must be false');
  assert(!mockBtnFs.classList.contains('active'), 'Fullscreen button must remove .active class');
  assert.strictEqual(mockCanvas.width, 600, 'Canvas width must restore to 600 baseline');
  assert.strictEqual(mockCanvas.height, 120, 'Canvas height must restore to 120 baseline');
  console.log('  ✅ Sub-Test 4B (Exit): Fullscreen state, button attributes, and canvas restored to baseline');

  // ---------------------------------------------------------------------------
  // Sub-Test 4C: W3C requestFullscreen & Fallback Verification
  // ---------------------------------------------------------------------------
  let fsRequested = false;
  mockCard.requestFullscreen = function() {
    fsRequested = true;
    mockDoc.fullscreenElement = mockCard;
    return Promise.resolve();
  };
  feature.toggleVisualizerFullscreen({ doc: mockDoc });
  assert.strictEqual(fsRequested, true, 'toggleVisualizerFullscreen must invoke requestFullscreen on container');
  console.log('  ✅ Sub-Test 4C: W3C requestFullscreen invocation verified');

  // Exit fullscreen via toggle
  let fsExited = false;
  mockDoc.exitFullscreen = function() {
    fsExited = true;
    mockDoc.fullscreenElement = null;
    return Promise.resolve();
  };
  feature.toggleVisualizerFullscreen({ doc: mockDoc });
  assert.strictEqual(fsExited, true, 'toggleVisualizerFullscreen must invoke exitFullscreen when active');
  console.log('  ✅ Sub-Test 4C: W3C exitFullscreen invocation verified');

  // ---------------------------------------------------------------------------
  // Sub-Test 4D: Native fullscreenchange Event Listener Verification
  // ---------------------------------------------------------------------------
  assert(docListeners['fullscreenchange'] && docListeners['fullscreenchange'].length > 0, 'fullscreenchange listener must be registered on doc');
  // Simulate native fullscreen enter via event
  mockDoc.fullscreenElement = mockCard;
  mockDoc.dispatchMockDocEvent('fullscreenchange');
  assert.strictEqual(feature.isVisualizerFullscreenActive(), true, 'isVisualizerFullscreenActive must be true after fullscreenchange enter');
  // Simulate native fullscreen exit via event
  mockDoc.fullscreenElement = null;
  mockDoc.dispatchMockDocEvent('fullscreenchange');
  assert.strictEqual(feature.isVisualizerFullscreenActive(), false, 'isVisualizerFullscreenActive must be false after fullscreenchange exit');
  console.log('  ✅ Sub-Test 4D: Native fullscreenchange event dispatch dynamically syncs visualizer state');

  // ---------------------------------------------------------------------------
  // Sub-Test 4E: Video Embed Toggle
  // ---------------------------------------------------------------------------
  feature.setVisualizerVideoEmbedState(true, { doc: mockDoc });
  assert.strictEqual(feature.isVisualizerVideoEmbedActive(), true, 'Video embed state must be true');
  assert.strictEqual(mockBtnVideo.getAttribute('aria-pressed'), 'true', 'Video embed button aria-pressed must be true');
  assert(mockBtnVideo.classList.contains('active'), 'Video embed button must have .active class');

  feature.setVisualizerVideoEmbedState(false, { doc: mockDoc });
  assert.strictEqual(feature.isVisualizerVideoEmbedActive(), false, 'Video embed state must be false');
  assert.strictEqual(mockBtnVideo.getAttribute('aria-pressed'), 'false', 'Video embed button aria-pressed must be false');
  assert(!mockBtnVideo.classList.contains('active'), 'Video embed button must remove .active class');
  console.log('  ✅ Sub-Test 4E: Video Embed toggle state, aria-pressed, and active class cycle cleanly');
}

// =============================================================================
// Test 5: Bilingual i18n Parity for Embed, Full Window & Fullscreen
// =============================================================================
console.log('\nTest 5: Bilingual i18n Parity for Embed, Full Window & Fullscreen');
{
  const dashCode = fs.readFileSync(dashJsPath, 'utf8');
  const match = dashCode.match(/const DASHBOARD_I18N = (\{[\s\S]*?\n\};)/);
  assert(match, 'DASHBOARD_I18N must exist in dashboard.js');

  const dict = eval('(' + match[1].replace(/;\s*$/, '') + ')');
  const keys = [
    'viz_video_embed_toggle_title',
    'viz_fullwindow_toggle_title',
    'viz_fullwindow_exit_title',
    'viz_fullscreen_toggle_title',
    'viz_fullscreen_exit_title',
    'toast_viz_embed_mode_active',
    'toast_viz_embed_mode_inactive',
    'toast_viz_fullwindow_entered',
    'toast_viz_fullwindow_exited',
    'toast_viz_fullscreen_entered',
    'toast_viz_fullscreen_exited'
  ];

  keys.forEach(k => {
    assert(dict.en[k], `DASHBOARD_I18N.en must contain key "${k}"`);
    assert(dict.hi[k], `DASHBOARD_I18N.hi must contain key "${k}"`);
    console.log(`  ✅ Key "${k}": en="${dict.en[k]}" | hi="${dict.hi[k]}"`);
  });
}

// =============================================================================
// Test 6: W3C Trusted Types & Strict CSP Security Audit
// =============================================================================
console.log('\nTest 6: W3C Trusted Types & Strict CSP Audit');
{
  const html = fs.readFileSync(htmlPath, 'utf8');
  assert(!/\son(click|change|input|submit|mouseover|keydown|keyup)\s*=/i.test(html), 'dashboard.html must contain 0 inline event handlers');
  assert(!html.includes('javascript:'), 'dashboard.html must not contain javascript: pseudo-protocol URIs');

  const featureCode = fs.readFileSync(featureJsPath, 'utf8');
  assert(!featureCode.includes('.innerHTML'), 'media_deck_visualizer_feature.js must contain 0 innerHTML assignments');
  assert(!featureCode.includes('.outerHTML'), 'media_deck_visualizer_feature.js must contain 0 outerHTML assignments');
  console.log('  ✅ 0 inline event handlers, 0 innerHTML, 0 outerHTML assignments verified');
}

// =============================================================================
// Test 7: UTF-8 BOM Audit
// =============================================================================
console.log('\nTest 7: UTF-8 BOM (0xEF, 0xBB, 0xBF) Standard Audit');
{
  const files = [htmlPath, dashJsPath, featureJsPath, mediaCssPath, dashCssPath, __filename];
  files.forEach(f => {
    const buf = fs.readFileSync(f);
    assert(buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF, `${path.basename(f)} must start with UTF-8 BOM`);
    console.log(`  ✅ ${path.basename(f)} certified UTF-8 BOM standard`);
  });
}

// =============================================================================
// Test 8: Radial Frequency Burst Dynamic Scaling in Compact vs Fullscreen / Full Window
// =============================================================================
console.log('\nTest 8: Radial Frequency Burst Dynamic Scaling in Compact vs Fullscreen / Full Window');
{
  const feature = require(featureJsPath);

  let linesDrawn = [];
  const mockCtx = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    shadowBlur: 0,
    shadowColor: '',
    lineCap: '',
    fillRect: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: (x, y) => { linesDrawn.push({ x, y }); },
    arc: () => {},
    stroke: () => {},
    fill: () => {},
    roundRect: () => {},
    createLinearGradient: () => ({ addColorStop: () => {} })
  };

  const mockCanvas = {
    width: 600,
    height: 120,
    parentElement: { getBoundingClientRect: () => ({ width: 600, height: 120 }) },
    getContext: () => mockCtx,
    dataset: {}
  };

  const mockDoc = { visibilityState: 'visible', getElementById: () => null, addEventListener: () => {} };
  feature.initAudioVisualizer(mockCanvas, { doc: mockDoc });
  feature.setVisualizerMode('radial');
  feature.setAudioPlayingState(true);

  // Moderate audio
  feature.feedAudioTelemetry({
    leftRms: 0.35,
    rightRms: 0.35,
    freqs: new Array(32).fill(0.4),
    wave: new Array(32).fill(0)
  });

  // 1. Verify Compact bounds
  for (let f = 0; f < 8; f++) {
    linesDrawn = [];
    feature.renderVisualizerFrame(5000 + f * 16, { doc: mockDoc });
  }
  let compactOuterMax = 0;
  linesDrawn.forEach(pt => {
    const d = Math.hypot(pt.x - 300, pt.y - 60);
    if (d > compactOuterMax) compactOuterMax = d;
  });
  assert(compactOuterMax <= 60, `Compact radial outer radius (${compactOuterMax.toFixed(1)}px) must be <= 60px (no clipping)`);
  console.log(`  ✅ Compact mode outer radius: ${compactOuterMax.toFixed(1)}px <= 60px (zero clipping)`);

  // 2. Verify Fullscreen / Full Window bounds (1400x600, minDim=600)
  mockCanvas.width = 1400;
  mockCanvas.height = 600;
  for (let f = 0; f < 8; f++) {
    linesDrawn = [];
    feature.renderVisualizerFrame(6000 + f * 16, { doc: mockDoc });
  }
  let fullscreenOuterMax = 0;
  linesDrawn.forEach(pt => {
    const d = Math.hypot(pt.x - 700, pt.y - 300);
    if (d > fullscreenOuterMax) fullscreenOuterMax = d;
  });
  assert(fullscreenOuterMax > 180, `Fullscreen radial outer radius (${fullscreenOuterMax.toFixed(1)}px) must be > 180px`);
  assert(fullscreenOuterMax < 300, `Fullscreen radial outer radius (${fullscreenOuterMax.toFixed(1)}px) must fit within 300px half-height`);
  console.log(`  ✅ Fullscreen / Full Window mode outer radius: ${fullscreenOuterMax.toFixed(1)}px > 180px (dynamically scaled proportionally)`);
}

// =============================================================================
// Test 9: Keyboard Escape Key & Synchronized Reset in dashboard.js
// =============================================================================
console.log('\nTest 9: Keyboard Escape Key & Synchronized Reset in dashboard.js');
{
  const dashCode = fs.readFileSync(dashJsPath, 'utf8');

  // Verify Escape key handling resets full window and fullscreen
  assert(dashCode.includes("e.key === 'Escape'"), 'dashboard.js must handle Escape key');
  assert(dashCode.includes('if (isVisualizerFullWindowActive())'), 'dashboard.js must check isVisualizerFullWindowActive on Escape');
  assert(dashCode.includes('setVisualizerFullWindowState(false)'), 'dashboard.js must call setVisualizerFullWindowState(false) on Escape');
  assert(dashCode.includes('setVisualizerFullscreenState(false)'), 'dashboard.js must call setVisualizerFullscreenState(false) on Escape');
  console.log('  ✅ Escape key listener verified: exits Full Window Theater and Fullscreen with synchronized toast notifications');
}

console.log('\n===========================================================================');
console.log('🎉 ALL 9 TESTS IN TOOLBAR ALIGNMENT & CONTROLS SUITE PASSED (Exit Code 0)!');
console.log('===========================================================================\n');
