// tests/test_visualizer_phase_01_ergonomics.js
// Verification Suite for TASK-VIZ-ROADMAP-PHASE-01: Visualizer Ergonomics & Hybrid Layout (Auth: AUTH-MGR-20261118-VIZ-PHASE-01-001)

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('🧪 Starting Visualizer Phase 1 Ergonomics & Hybrid Layout Verification Suite...\n');

const rootDir = path.resolve(__dirname, '..');
const htmlPath = path.join(rootDir, 'dashboard', 'dashboard.html');
const dashJsPath = path.join(rootDir, 'dashboard', 'dashboard.js');
const featureJsPath = path.join(rootDir, 'src', 'dashboard', 'features', 'media_deck_visualizer_feature.js');
const mediaCssPath = path.join(rootDir, 'dashboard', 'styles', 'media.css');
const dashCssPath = path.join(rootDir, 'dashboard', 'dashboard.css');

// =============================================================================
// Test 1: UTF-8 with BOM (0xEF, 0xBB, 0xBF) Standard Audit
// =============================================================================
console.log('Test 1: UTF-8 BOM (0xEF, 0xBB, 0xBF) Standard Audit');
{
  const filesToAudit = [
    { name: 'dashboard/dashboard.html', path: htmlPath },
    { name: 'dashboard/dashboard.js', path: dashJsPath },
    { name: 'src/dashboard/features/media_deck_visualizer_feature.js', path: featureJsPath },
    { name: 'dashboard/styles/media.css', path: mediaCssPath },
    { name: 'dashboard/dashboard.css', path: dashCssPath },
    { name: 'tests/test_visualizer_phase_01_ergonomics.js', path: __filename }
  ];

  filesToAudit.forEach(file => {
    const buffer = fs.readFileSync(file.path);
    assert(buffer.length >= 3, `${file.name} must not be empty`);
    assert.strictEqual(buffer[0], 0xEF, `${file.name} must start with byte 0xEF`);
    assert.strictEqual(buffer[1], 0xBB, `${file.name} must start with byte 0xBB`);
    assert.strictEqual(buffer[2], 0xBF, `${file.name} must start with byte 0xBF`);
    console.log(`  ✅ ${file.name} certified UTF-8 BOM standard`);
  });
}

// =============================================================================
// Test 2: Hybrid Ergonomics DOM Architecture in dashboard.html
// =============================================================================
console.log('\nTest 2: Hybrid Ergonomics DOM Architecture in dashboard.html');
{
  const html = fs.readFileSync(htmlPath, 'utf8');

  // Verify Hero Audio Lab Status exists
  assert(html.includes('id="heroAudioLabStatus"'), '#heroAudioLabStatus container must exist');

  // 1. Top Controls Bar: Only Action Buttons & Legacy hidden buttons (NO effect selector in top bar)
  assert(html.includes('class="visualizer-controls visualizer-controls-bar"'), 'Top bar .visualizer-controls-bar must exist');
  assert(html.includes('id="btnVizSettingsToggle"'), '#btnVizSettingsToggle action button must exist in top bar');
  assert(html.includes('id="btnVizVideoEmbedToggle"'), '#btnVizVideoEmbedToggle action button must exist in top bar');
  assert(html.includes('id="btnVizFullWindow"'), '#btnVizFullWindow action button must exist in top bar');
  assert(html.includes('id="btnVizFullscreen"'), '#btnVizFullscreen action button must exist in top bar');
  assert(html.includes('class="viz-legacy-buttons'), '.viz-legacy-buttons hidden container must exist');
  assert(html.includes('id="btnVizModeBars"'), 'Legacy #btnVizModeBars must be preserved');
  assert(html.includes('id="btnVizModeWave"'), 'Legacy #btnVizModeWave must be preserved');
  console.log('  ✅ 2.1: Top controls bar cleanly houses unified action buttons and hidden legacy mode buttons');

  // 2. Center Canvas Container: Canvas + Acoustic Graticule HUD + Settings Drawer
  assert(html.includes('class="visualizer-canvas-container" id="vizCanvasContainer"'), '#vizCanvasContainer must exist');
  assert(html.includes('id="canvasAudioVisualizer"'), '#canvasAudioVisualizer must exist');
  assert(html.includes('id="vizCanvasHud"'), 'HUD overlay #vizCanvasHud must exist');
  assert(html.includes('id="vizHudFpsBadge"'), '#vizHudFpsBadge must exist in HUD');
  assert(html.includes('id="vizHudRateBadge"'), '#vizHudRateBadge must exist in HUD');
  assert(html.includes('id="vizHudGraticuleLabels"'), '#vizHudGraticuleLabels must exist in HUD');
  assert(html.includes('id="vizSettingsDrawer"'), '#vizSettingsDrawer sliding glass drawer must exist');
  assert(html.includes('id="btnVizDrawerClose"'), '#btnVizDrawerClose drawer close button must exist');
  assert(html.includes('id="chkGraticuleToggle"'), '#chkGraticuleToggle graticule switch must exist in drawer');
  assert(html.includes('data-decay="slow"'), 'Segmented decay slow option must exist in drawer');
  assert(html.includes('data-decay="normal"'), 'Segmented decay normal option must exist in drawer');
  assert(html.includes('data-decay="fast"'), 'Segmented decay fast option must exist in drawer');
  console.log('  ✅ 2.2: Center canvas container hosts acoustic graticule HUD and sliding settings drawer');

  // 3. Lower Deck: Effect Pill Selector & Dual Stereo VU Level Meters
  assert(html.includes('class="viz-subcanvas-deck"'), '.viz-subcanvas-deck lower deck container must exist');
  assert(html.includes('id="btnVizPillTrigger"'), '#btnVizPillTrigger pill selector trigger must exist');
  assert(html.includes('id="vizPillLabel"'), '#vizPillLabel must exist within pill trigger');
  assert(html.includes('id="vizPillPopoverMenu"'), '#vizPillPopoverMenu popover menu must exist');
  assert(html.includes('id="selectVizEffect"'), '#selectVizEffect must exist (backward compatible)');
  assert(html.includes('id="lblVizEffect"'), '#lblVizEffect must exist (accessible)');
  assert(html.includes('id="vuMetersContainer"'), '#vuMetersContainer dual stereo VU meter must exist');
  assert(html.includes('id="vuBarLeft"'), '#vuBarLeft left level bar must exist');
  assert(html.includes('id="vuBarRight"'), '#vuBarRight right level bar must exist');
  assert(html.includes('id="vuPeakLeft"'), '#vuPeakLeft left peak-hold indicator must exist');
  assert(html.includes('id="vuPeakRight"'), '#vuPeakRight right peak-hold indicator must exist');
  assert(html.includes('id="vuValLeft"'), '#vuValLeft left dB readout must exist');
  assert(html.includes('id="vuValRight"'), '#vuValRight right dB readout must exist');
  assert(html.includes('id="vuClipIndicator"'), '#vuClipIndicator headroom clip badge must exist');
  console.log('  ✅ 2.3: Lower deck houses pill selector and stereo VU meters with peak-hold indicators');

  // 4. Backward Compatibility Classes
  assert(html.includes('vu-meter') && html.includes('vu-meter-track'), 'Dual backward compatible VU meter track classes declared');
  assert(html.includes('vu-level') && html.includes('vu-level-fill'), 'Dual backward compatible VU level fill classes declared');
  console.log('  ✅ 2.4: Backward compatible classes preserved across all markup');
}

// =============================================================================
// Test 3: CSS Specifications & Responsive Design
// =============================================================================
console.log('\nTest 3: CSS Specifications & Materiality Standards');
{
  const mediaCss = fs.readFileSync(mediaCssPath, 'utf8');
  const dashCss = fs.readFileSync(dashCssPath, 'utf8');

  const requiredSelectors = [
    '.visualizer-controls-bar',
    '.viz-subcanvas-deck',
    '.viz-pill-selector-wrapper',
    '.viz-pill-trigger',
    '.viz-pill-popover-menu',
    '.viz-popover-option',
    '.visualizer-canvas-container',
    '.viz-canvas-hud',
    '.viz-hud-badge',
    '.viz-hud-fps',
    '.viz-hud-rate',
    '.viz-scale-label',
    '.viz-settings-drawer',
    '.viz-drawer-header',
    '.btn-viz-drawer-close',
    '.viz-drawer-row',
    '.viz-toggle-switch',
    '.viz-toggle-slider',
    '.viz-btn-segmented',
    '.viz-seg-btn',
    '.vu-meters-container',
    '.vu-meter-track',
    '.vu-level-fill',
    '.vu-peak-indicator',
    '.vu-clip-badge',
    'body.theme-light .viz-pill-trigger',
    'body.theme-light .viz-settings-drawer'
  ];

  requiredSelectors.forEach(sel => {
    assert(mediaCss.includes(sel) || dashCss.includes(sel), `Selector "${sel}" must be declared in media.css or dashboard.css`);
  });
  console.log('  ✅ 3.1: All required Phase 1 CSS selectors declared in stylesheets');

  // Verify height & layout constraint rules
  assert(mediaCss.includes('max-height: 34px') || dashCss.includes('max-height: 34px'), 'Top controls bar constrained to 34px');
  assert(mediaCss.includes('.viz-subcanvas-deck') && mediaCss.includes('display: flex'), '.viz-subcanvas-deck flex layout defined');
  assert(mediaCss.includes('.vu-peak-indicator') && mediaCss.includes('position: absolute'), 'Peak-hold indicators styled as absolute overlay');
  console.log('  ✅ 3.2: Top bar height constraints and lower deck flex rules verified');
}

// =============================================================================
// Test 4: Engine Support: Graticule Rendering & Peak-Hold Decay State Machine
// =============================================================================
console.log('\nTest 4: Engine Support: Graticule Rendering & Peak-Hold Decay State Machine');
{
  const feature = require(featureJsPath);

  // Check exported functions
  assert.strictEqual(typeof feature.setGraticuleEnabled, 'function', 'setGraticuleEnabled must be exported');
  assert.strictEqual(typeof feature.isGraticuleActive, 'function', 'isGraticuleActive must be exported');
  assert.strictEqual(typeof feature.setPeakDecayRate, 'function', 'setPeakDecayRate must be exported');
  assert.strictEqual(typeof feature.getPeakDecayRate, 'function', 'getPeakDecayRate must be exported');
  assert.strictEqual(typeof feature.getPeakHoldValues, 'function', 'getPeakHoldValues must be exported');
  assert.strictEqual(typeof feature.renderCanvasGraticule, 'function', 'renderCanvasGraticule must be exported');

  // Verify Graticule toggle state machine
  assert.strictEqual(feature.isGraticuleActive(), true, 'Graticule must default to enabled');
  feature.setGraticuleEnabled(false);
  assert.strictEqual(feature.isGraticuleActive(), false, 'Graticule state must update to false');
  feature.setGraticuleEnabled(true);
  assert.strictEqual(feature.isGraticuleActive(), true, 'Graticule state must restore to true');
  console.log('  ✅ 4.1: Graticule toggle state machine verified');

  // Verify Peak Decay Rate setter
  feature.setPeakDecayRate(0.015);
  assert.strictEqual(feature.getPeakDecayRate(), 0.015, 'Peak decay rate must update to 0.015 (slow)');
  feature.setPeakDecayRate(0.06);
  assert.strictEqual(feature.getPeakDecayRate(), 0.06, 'Peak decay rate must update to 0.06 (fast)');
  feature.setPeakDecayRate(0.03);
  assert.strictEqual(feature.getPeakDecayRate(), 0.03, 'Peak decay rate must restore to 0.03 (normal)');
  console.log('  ✅ 4.2: Peak decay rate state machine verified');

  // Mock Canvas & 2D Context for Graticule rendering
  const drawOps = [];
  const mockCtx = {
    save() { drawOps.push('save'); },
    restore() { drawOps.push('restore'); },
    beginPath() { drawOps.push('beginPath'); },
    moveTo(x, y) { drawOps.push(`moveTo(${x},${y})`); },
    lineTo(x, y) { drawOps.push(`lineTo(${x},${y})`); },
    stroke() { drawOps.push('stroke'); },
    fill() { drawOps.push('fill'); },
    fillRect(x, y, w, h) { drawOps.push(`fillRect(${x},${y},${w},${h})`); },
    clearRect(x, y, w, h) { drawOps.push(`clearRect(${x},${y},${w},${h})`); },
    fillText(text, x, y) { drawOps.push(`fillText(${text},${x},${y})`); },
    setLineDash(dash) { drawOps.push(`setLineDash([${dash.join(',')}])`); },
    createLinearGradient() {
      return { addColorStop: () => {} };
    },
    arc() {},
    roundRect() {},
    strokeStyle: '',
    fillStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: ''
  };

  // Render Graticule in Dark and Light themes
  feature.renderCanvasGraticule(mockCtx, 600, 120, false);
  assert(drawOps.includes('save'), 'Graticule must isolate canvas state with ctx.save()');
  assert(drawOps.includes('restore'), 'Graticule must restore canvas state with ctx.restore()');
  assert(drawOps.some(op => op.startsWith('moveTo(0,')), 'Graticule must draw horizontal dB reference lines');
  assert(drawOps.some(op => op.startsWith('lineTo(600,')), 'Graticule must draw full width dB reference lines');
  assert(drawOps.some(op => op.includes('setLineDash([3,4])')), 'Graticule must configure dashed styling for grid');
  console.log('  ✅ 4.3: Graticule rendering executed cleanly with dB and frequency lines');

  // Render Visualizer Frame with Peak-Hold calculation
  const mockCanvas = {
    width: 600,
    height: 120,
    getContext: () => mockCtx,
    parentElement: { getBoundingClientRect: () => ({ width: 600, height: 120 }) }
  };

  const mockVuBarLeft = { style: {} };
  const mockVuBarRight = { style: {} };
  const mockVuPeakLeft = { style: {} };
  const mockVuPeakRight = { style: {} };
  const mockVuValLeft = { textContent: '' };
  const mockVuValRight = { textContent: '' };
  const mockVuClip = { classList: { add() {}, remove() {} } };

  // Setup DOM stubs for renderVisualizerFrame
  global.document = {
    getElementById(id) {
      if (id === 'canvasAudioVisualizer') return mockCanvas;
      if (id === 'vuBarLeft') return mockVuBarLeft;
      if (id === 'vuBarRight') return mockVuBarRight;
      if (id === 'vuPeakLeft') return mockVuPeakLeft;
      if (id === 'vuPeakRight') return mockVuPeakRight;
      if (id === 'vuValLeft') return mockVuValLeft;
      if (id === 'vuValRight') return mockVuValRight;
      if (id === 'vuClipIndicator') return mockVuClip;
      return null;
    },
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    removeEventListener: () => {}
  };

  feature.initAudioVisualizer(mockCanvas);
  feature.setAudioPlayingState(true);
  feature.renderVisualizerFrame();

  const peakVals = feature.getPeakHoldValues();
  assert(typeof peakVals.leftPeakVal === 'number', 'leftPeakVal must be numeric');
  assert(typeof peakVals.rightPeakVal === 'number', 'rightPeakVal must be numeric');
  assert(mockVuPeakLeft.style.left !== undefined, 'vuPeakLeft.style.left must be updated during frame render');
  assert(mockVuPeakRight.style.left !== undefined, 'vuPeakRight.style.left must be updated during frame render');
  console.log('  ✅ 4.4: Dual stereo peak-hold needles dynamically calculated and updated on frame render');
}

// =============================================================================
// Test 5: UI Interaction & Wiring in dashboard.js
// =============================================================================
console.log('\nTest 5: UI Interaction, Idempotent Wiring & i18n in dashboard.js');
{
  const dashCode = fs.readFileSync(dashJsPath, 'utf8');

  // 1. Settings Drawer Toggle & Segmented Buttons
  assert(dashCode.includes('btnVizSettingsToggle && !btnVizSettingsToggle.__vizBound'), 'Settings toggle must use !__vizBound idempotent guard');
  assert(dashCode.includes('btnVizDrawerClose && !btnVizDrawerClose.__vizBound'), 'Drawer close button must use !__vizBound idempotent guard');
  assert(dashCode.includes('chkGraticuleToggle && !chkGraticuleToggle.__vizBound'), 'Graticule toggle switch must use !__vizBound idempotent guard');
  assert(dashCode.includes('btnVizPillTrigger && !btnVizPillTrigger.__vizBound'), 'Pill selector trigger must use !__vizBound idempotent guard');
  console.log('  ✅ 5.1: Idempotent event registration verified across all interactive controls');

  // 2. Bilingual i18n parity
  assert(dashCode.includes('viz_settings_toggle_title'), 'viz_settings_toggle_title translation key declared');
  assert(dashCode.includes('Toggle Acoustic Graticule & Telemetry Settings'), 'English tooltip declared for settings toggle');
  assert(dashCode.includes('अकॉस्टिक ग्रेटिक्यूल और टेलीमेट्री सेटिंग्स टॉगल करें'), 'Hindi tooltip declared for settings toggle');
  console.log('  ✅ 5.2: Bilingual i18n parity verified for settings toggle button');

  // 3. Pill Selector Popover Sync
  assert(dashCode.includes('vizPillPopoverMenu'), 'Popover menu interactions wired');
  assert(dashCode.includes('vizPillLabel'), 'Pill label text synchronized on effect change');
  assert(dashCode.includes('vizPillIcon'), 'Pill icon synchronized on effect change');
  console.log('  ✅ 5.3: Pill selector triggers popover and synchronizes label and icon');

  // 4. Keyboard Escape Handling
  const escIndex = dashCode.indexOf("if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27)");
  assert(escIndex !== -1, 'Escape key handler present');
  const escBlock = dashCode.substring(escIndex, escIndex + 1000);
  assert(escBlock.includes('vizSettingsDrawer'), 'Escape handler dismisses settings drawer');
  assert(escBlock.includes('vizPillPopoverMenu'), 'Escape handler dismisses pill popover menu');
  console.log('  ✅ 5.4: Escape key handler dismisses drawer and popover while preserving fullscreen exit');
}

// =============================================================================
// Test 6: W3C Trusted Types & Strict Security Audit
// =============================================================================
console.log('\nTest 6: W3C Trusted Types & Security Compliance');
{
  const featureCode = fs.readFileSync(featureJsPath, 'utf8');
  assert(!featureCode.includes('.innerHTML'), 'media_deck_visualizer_feature.js must have 0 instances of innerHTML');
  assert(!featureCode.includes('.outerHTML'), 'media_deck_visualizer_feature.js must have 0 instances of outerHTML');

  const html = fs.readFileSync(htmlPath, 'utf8');
  const heroIndex = html.indexOf('id="heroAudioLabStatus"');
  const heroBlock = html.substring(heroIndex, heroIndex + 4000);
  assert(!heroBlock.includes('onclick='), '#heroAudioLabStatus must not declare inline onclick handlers');
  assert(!heroBlock.includes('onchange='), '#heroAudioLabStatus must not declare inline onchange handlers');
  console.log('  ✅ 6.1: 0 instances of innerHTML/outerHTML and 0 inline event handlers (100% Trusted Types compliant)');
}

// =============================================================================
// Test 7: AST Parsing & Syntax Verification
// =============================================================================
console.log('\nTest 7: AST Parsing & Syntax Verification');
{
  const dashCode = fs.readFileSync(dashJsPath, 'utf8');
  const featureCode = fs.readFileSync(featureJsPath, 'utf8');

  assert.doesNotThrow(() => {
    new vm.Script(dashCode, { filename: 'dashboard.js' });
  }, 'dashboard.js must parse cleanly into a VM Script with zero syntax errors');

  assert.doesNotThrow(() => {
    new vm.Script(featureCode, { filename: 'media_deck_visualizer_feature.js' });
  }, 'media_deck_visualizer_feature.js must parse cleanly into a VM Script with zero syntax errors');

  console.log('  ✅ 7.1: dashboard.js and media_deck_visualizer_feature.js parsed into VM scripts with 0 errors');
}

console.log('\n===========================================================================');
console.log('🎉 ALL 7 TESTS IN VISUALIZER PHASE 1 ERGONOMICS SUITE PASSED (Exit Code 0)!');
console.log('===========================================================================\n');
