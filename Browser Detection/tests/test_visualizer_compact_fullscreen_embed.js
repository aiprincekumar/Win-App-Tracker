// tests/test_visualizer_compact_fullscreen_embed.js
// Verification Suite for TASK-VIZ-COMPACT-FULLSCREEN-EMBED-003: Compact Header, Video Embed Toggle & Visualizer Fullscreen

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting Visualizer Compact Header, Fullscreen & Video Embed Verification Suite (TASK-VIZ-COMPACT-FULLSCREEN-EMBED-003)...\n');

const rootDir = path.resolve(__dirname, '..');
const htmlPath = path.join(rootDir, 'dashboard', 'dashboard.html');
const dashJsPath = path.join(rootDir, 'dashboard', 'dashboard.js');
const featureJsPath = path.join(rootDir, 'src', 'dashboard', 'features', 'media_deck_visualizer_feature.js');
const mediaCssPath = path.join(rootDir, 'dashboard', 'styles', 'media.css');
const dashCssPath = path.join(rootDir, 'dashboard', 'dashboard.css');

// =============================================================================
// Test 1: UI/UX Cleanup & Compact Header Verification in dashboard.html
// =============================================================================
console.log('Test 1: UI/UX Cleanup & Compact Header in dashboard.html');
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

  // Verify Dropdown exists
  assert(html.includes('id="selectVizEffect"'), '#selectVizEffect dropdown must exist');
  console.log('  ✅ #selectVizEffect dropdown confirmed preserved');
}

// =============================================================================
// Test 2: Two Action Icon Buttons Specification in dashboard.html
// =============================================================================
console.log('\nTest 2: Two Action Icon Buttons Specification in dashboard.html');
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

  // Button 2: Fullscreen / Enlarge Visualizer
  assert(html.includes('id="btnVizFullscreen"'), '#btnVizFullscreen must exist in dashboard.html');
  const btnFsMatch = html.match(/<button[^>]*id="btnVizFullscreen"[^>]*>/);
  assert(btnFsMatch, '#btnVizFullscreen declaration must exist');
  assert(btnFsMatch[0].includes('btn-viz-action-icon'), '#btnVizFullscreen must have btn-viz-action-icon class');
  assert(btnFsMatch[0].includes('title="Toggle Visualizer Fullscreen"'), '#btnVizFullscreen title attribute verified');
  assert(btnFsMatch[0].includes('aria-label="Toggle Visualizer Fullscreen"'), '#btnVizFullscreen aria-label attribute verified');
  assert(btnFsMatch[0].includes('aria-expanded="false"'), '#btnVizFullscreen aria-expanded="false" attribute verified');
  assert(btnFsMatch[0].includes('tabindex="0"'), '#btnVizFullscreen tabindex="0" attribute verified');

  // Verify Dual Expand & Compress SVG Icons inside Fullscreen button
  assert(html.includes('viz-icon-expand'), '.viz-icon-expand SVG icon must exist');
  assert(html.includes('viz-icon-compress'), '.viz-icon-compress SVG icon must exist');
  console.log('  ✅ Button 2: Fullscreen Visualizer (#btnVizFullscreen) specification verified');
}

// =============================================================================
// Test 3: CSS Materiality, Spacing & Theater Mode Tokens in Stylesheets
// =============================================================================
console.log('\nTest 3: CSS Materiality, Spacing & Theater Mode Tokens');
{
  const mediaCss = fs.readFileSync(mediaCssPath, 'utf8');
  const dashCss = fs.readFileSync(dashCssPath, 'utf8');

  const requiredSelectors = [
    '.btn-viz-action-icon',
    '.btn-viz-action-icon:hover',
    '.btn-viz-action-icon:active',
    '.btn-viz-action-icon.active',
    '.visualizer-controls-bar',
    '#heroAudioLabStatus.visualizer-theater-mode',
    '#heroAudioLabStatus:fullscreen'
  ];

  requiredSelectors.forEach(sel => {
    assert(mediaCss.includes(sel), `media.css must declare ${sel}`);
    assert(dashCss.includes(sel), `dashboard.css must declare ${sel}`);
    console.log(`  ✅ CSS Selector "${sel}" verified declared in media.css and dashboard.css`);
  });
}

// =============================================================================
// Test 4: Visualizer Feature Logic (Fullscreen & Video Embed Engine)
// =============================================================================
console.log('\nTest 4: Visualizer Feature Logic & Dynamic Canvas Adaptation');
{
  const feature = require(featureJsPath);

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
      addEventListener: () => {}
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
  const mockBtnFs = createMockElement('btnVizFullscreen');
  const mockBtnVideo = createMockElement('btnVizVideoEmbedToggle');
  const mockDoc = {
    body: createMockElement('body'),
    getElementById: (id) => {
      if (id === 'heroAudioLabStatus') return mockCard;
      if (id === 'btnVizFullscreen') return mockBtnFs;
      if (id === 'btnVizVideoEmbedToggle') return mockBtnVideo;
      if (id === 'canvasAudioVisualizer') return mockCanvas;
      return null;
    },
    addEventListener: () => {}
  };

  feature.initAudioVisualizer(mockCanvas, { doc: mockDoc });

  // Test Fullscreen Activation
  feature.setVisualizerFullscreenState(true, { doc: mockDoc });
  assert.strictEqual(feature.isVisualizerFullscreenActive(), true, 'Fullscreen state must be true');
  assert(mockCard.classList.contains('visualizer-theater-mode'), 'Card must have .visualizer-theater-mode class');
  assert.strictEqual(mockBtnFs.getAttribute('aria-expanded'), 'true', 'Fullscreen button aria-expanded must be true');
  assert(mockBtnFs.classList.contains('active'), 'Fullscreen button must have .active class');
  assert.strictEqual(mockCanvas.width, 1400, 'Canvas width must adapt to container width in fullscreen');
  assert.strictEqual(mockCanvas.height, 600, 'Canvas height must adapt to container height in fullscreen');
  console.log('  ✅ Fullscreen enter: DOM classes, aria-expanded, and canvas resolution (1400x600) adapted cleanly');

  // Test Fullscreen Exit
  feature.setVisualizerFullscreenState(false, { doc: mockDoc });
  assert.strictEqual(feature.isVisualizerFullscreenActive(), false, 'Fullscreen state must be false');
  assert(!mockCard.classList.contains('visualizer-theater-mode'), 'Card must remove .visualizer-theater-mode class');
  assert.strictEqual(mockBtnFs.getAttribute('aria-expanded'), 'false', 'Fullscreen button aria-expanded must be false');
  assert(!mockBtnFs.classList.contains('active'), 'Fullscreen button must remove .active class');
  assert.strictEqual(mockCanvas.width, 600, 'Canvas width must restore to 600 baseline');
  assert.strictEqual(mockCanvas.height, 120, 'Canvas height must restore to 120 baseline');
  console.log('  ✅ Fullscreen exit: DOM classes, aria-expanded, and canvas resolution restored to 600x120 baseline');

  // Test Video Embed Toggle
  feature.setVisualizerVideoEmbedState(true, { doc: mockDoc });
  assert.strictEqual(feature.isVisualizerVideoEmbedActive(), true, 'Video embed state must be true');
  assert.strictEqual(mockBtnVideo.getAttribute('aria-pressed'), 'true', 'Video embed button aria-pressed must be true');
  assert(mockBtnVideo.classList.contains('active'), 'Video embed button must have .active class');

  feature.setVisualizerVideoEmbedState(false, { doc: mockDoc });
  assert.strictEqual(feature.isVisualizerVideoEmbedActive(), false, 'Video embed state must be false');
  assert.strictEqual(mockBtnVideo.getAttribute('aria-pressed'), 'false', 'Video embed button aria-pressed must be false');
  assert(!mockBtnVideo.classList.contains('active'), 'Video embed button must remove .active class');
  console.log('  ✅ Video Embed toggle: state, aria-pressed, and active class cycle cleanly');
}

// =============================================================================
// Test 5: Bilingual i18n Parity for Video Embed & Fullscreen Tooltips/Toasts
// =============================================================================
console.log('\nTest 5: Bilingual i18n Parity for Embed & Fullscreen');
{
  const dashCode = fs.readFileSync(dashJsPath, 'utf8');
  const match = dashCode.match(/const DASHBOARD_I18N = (\{[\s\S]*?\n\};)/);
  assert(match, 'DASHBOARD_I18N must exist in dashboard.js');

  const dict = eval('(' + match[1].replace(/;\s*$/, '') + ')');
  const keys = [
    'viz_video_embed_toggle_title',
    'viz_fullscreen_toggle_title',
    'viz_fullscreen_exit_title',
    'toast_viz_embed_mode_active',
    'toast_viz_embed_mode_inactive',
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
  const files = [htmlPath, dashJsPath, featureJsPath, mediaCssPath, dashCssPath];
  files.forEach(f => {
    const buf = fs.readFileSync(f);
    assert(buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF, `${path.basename(f)} must start with UTF-8 BOM`);
    console.log(`  ✅ ${path.basename(f)} certified UTF-8 BOM standard`);
  });
}

console.log('\n===========================================================================');
console.log('🎉 ALL 7 TESTS IN COMPACT FULLSCREEN & EMBED SUITE PASSED (Exit Code 0)!');
console.log('===========================================================================\n');
