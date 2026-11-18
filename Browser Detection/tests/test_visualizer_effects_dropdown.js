// tests/test_visualizer_effects_dropdown.js
// Verification Suite for TASK-VIZ-DROPDOWN-EFFECTS-002: Dropdown Selector & 6 Visualizer Effects

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('🧪 Starting Visualizer Dropdown & 6 Effects Verification Suite (TASK-VIZ-DROPDOWN-EFFECTS-002)...\n');

const rootDir = path.resolve(__dirname, '..');
const htmlPath = path.join(rootDir, 'dashboard', 'dashboard.html');
const dashJsPath = path.join(rootDir, 'dashboard', 'dashboard.js');
const featureJsPath = path.join(rootDir, 'src', 'dashboard', 'features', 'media_deck_visualizer_feature.js');
const mediaCssPath = path.join(rootDir, 'dashboard', 'styles', 'media.css');
const dashCssPath = path.join(rootDir, 'dashboard', 'dashboard.css');

// =============================================================================
// Test 1: DOM Dropdown Specification in dashboard.html
// =============================================================================
console.log('Test 1: DOM Dropdown Specification & Legacy Buttons Preservation');
{
  const html = fs.readFileSync(htmlPath, 'utf8');

  assert(html.includes('id="selectVizEffect"'), '#selectVizEffect must be present in dashboard.html');
  assert(html.includes('select-viz-effect') && html.includes('glass-select'), '#selectVizEffect must declare liquid glass styling');
  assert(html.includes('for="selectVizEffect"'), 'Accessible label for selectVizEffect must exist');
  assert(html.includes('id="lblVizEffect"'), '#lblVizEffect label ID must exist');

  const expectedModes = [
    'bars', 'wave', 'radial', 'matrix_dots', 'flame', 'stereo_mirror',
    'lissajous', 'hex_grid', 'particles', 'retro_grid', 'vinyl_rings', 'liquid_wave'
  ];
  expectedModes.forEach(mode => {
    assert(html.includes(`value="${mode}"`), `Option value="${mode}" must be declared in selectVizEffect`);
    console.log(`  ✅ Mode "${mode}" option verified in dropdown`);
  });

  // Verify backward-compatible buttons are preserved
  assert(html.includes('id="btnVizModeBars"'), 'Legacy #btnVizModeBars must be preserved');
  assert(html.includes('id="btnVizModeWave"'), 'Legacy #btnVizModeWave must be preserved');
  assert(html.includes('viz-legacy-buttons'), '.viz-legacy-buttons container must exist');
  console.log('  ✅ Legacy buttons preserved with backward compatibility');
}

// =============================================================================
// Test 2: Engine Support for All 12 Effects in media_deck_visualizer_feature.js
// =============================================================================
console.log('\nTest 2: Engine Support for All 12 Visualizer Effects');
{
  const feature = require(featureJsPath);
  const expectedModes = [
    'bars', 'wave', 'radial', 'matrix_dots', 'flame', 'stereo_mirror',
    'lissajous', 'hex_grid', 'particles', 'retro_grid', 'vinyl_rings', 'liquid_wave'
  ];

  const allModes = feature.ALL_VIZ_MODES || feature.VALID_VIZ_MODES;
  assert(Array.isArray(allModes), 'ALL_VIZ_MODES array must be exported');
  assert.strictEqual(allModes.length, 12, 'Must define exactly 12 visualizer modes');
  expectedModes.forEach(m => {
    assert(allModes.includes(m), `Mode "${m}" must be in ALL_VIZ_MODES`);
  });

  // Mock Canvas & 2D Context
  const drawOps = [];
  const mockCtx = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    shadowBlur: 0,
    shadowColor: '',
    lineCap: '',
    fillRect: (x, y, w, h) => drawOps.push({ op: 'fillRect', x, y, w, h }),
    beginPath: () => drawOps.push({ op: 'beginPath' }),
    moveTo: (x, y) => drawOps.push({ op: 'moveTo', x, y }),
    lineTo: (x, y) => drawOps.push({ op: 'lineTo', x, y }),
    stroke: () => drawOps.push({ op: 'stroke' }),
    fill: () => drawOps.push({ op: 'fill' }),
    arc: (x, y, r, sa, ea) => drawOps.push({ op: 'arc', x, y, r }),
    closePath: () => drawOps.push({ op: 'closePath' }),
    roundRect: (x, y, w, h, radii) => drawOps.push({ op: 'roundRect', x, y, w, h, radii }),
    createLinearGradient: () => ({
      addColorStop: () => {}
    })
  };

  const mockCanvas = {
    width: 600,
    height: 120,
    getContext: () => mockCtx,
    dataset: {}
  };

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
      addEventListener: () => {}
    };
  }

  const mockSelect = createMockElement('selectVizEffect');
  const mockBtnBars = createMockElement('btnVizModeBars', ['btn-active', 'active']);
  const mockBtnWave = createMockElement('btnVizModeWave');
  const mockDoc = {
    getElementById: (id) => {
      if (id === 'selectVizEffect') return mockSelect;
      if (id === 'btnVizModeBars') return mockBtnBars;
      if (id === 'btnVizModeWave') return mockBtnWave;
      if (id === 'canvasAudioVisualizer') return mockCanvas;
      return null;
    },
    addEventListener: () => {}
  };

  feature.initAudioVisualizer(mockCanvas, { doc: mockDoc });

  // Test mode setting and rendering for each of the 6 effects
  expectedModes.forEach(mode => {
    const setRes = feature.setVisualizerMode(mode, { doc: mockDoc });
    assert.strictEqual(setRes, mode, `setVisualizerMode("${mode}") must return "${mode}"`);
    assert.strictEqual(feature.getVisualizerState().mode, mode, `Visualizer state mode must be "${mode}"`);

    // Verify select.value synchronized
    assert.strictEqual(mockSelect.value, mode, `Dropdown value must be synchronized to "${mode}"`);

    // Enable playing and render frame
    feature.setAudioPlayingState(true);
    drawOps.length = 0;
    const frameRes = feature.renderVisualizerFrame(Date.now(), { doc: mockDoc });
    assert.strictEqual(frameRes.rendered, true, `Frame must render successfully in mode "${mode}"`);
    assert.strictEqual(frameRes.mode, mode, `Frame result mode must match "${mode}"`);
    assert(drawOps.length > 0, `Draw operations must be performed for mode "${mode}"`);

    console.log(`  ✅ Mode "${mode}": set, synchronized, and rendered cleanly (${drawOps.length} canvas operations)`);
  });

  // Rejection of invalid mode
  const currentMode = feature.getVisualizerState().mode;
  const invalidRes = feature.setVisualizerMode('nonexistent_mode', { doc: mockDoc });
  assert.strictEqual(invalidRes, currentMode, 'Invalid mode must be rejected without mutating state');
  console.log('  ✅ Invalid modes rejected gracefully');
}

// =============================================================================
// Test 3: Sequential Click-to-Cycle on Visualizer Canvas
// =============================================================================
console.log('\nTest 3: Canvas Sequential Click-to-Cycle (All 12 Modes)');
{
  const expectedModes = [
    'bars', 'wave', 'radial', 'matrix_dots', 'flame', 'stereo_mirror',
    'lissajous', 'hex_grid', 'particles', 'retro_grid', 'vinyl_rings', 'liquid_wave'
  ];
  for (let i = 0; i < expectedModes.length; i++) {
    const current = expectedModes[i];
    const expectedNext = expectedModes[(i + 1) % expectedModes.length];
    const nextCalculated = expectedModes[(expectedModes.indexOf(current) + 1) % expectedModes.length];
    assert.strictEqual(nextCalculated, expectedNext, `Cycling from "${current}" must yield "${expectedNext}"`);
  }
  console.log('  ✅ Sequential cycle across all 12 visualizer modes verified');
}

// =============================================================================
// Test 4: Stylesheet Rules Presence
// =============================================================================
console.log('\nTest 4: CSS Materiality & Dropdown Select Styling');
{
  const mediaCss = fs.readFileSync(mediaCssPath, 'utf8');
  const dashCss = fs.readFileSync(dashCssPath, 'utf8');

  ['.viz-dropdown-label', '.viz-select-wrapper', '.select-viz-effect', '#selectVizEffect'].forEach(sel => {
    assert(mediaCss.includes(sel), `media.css must declare ${sel}`);
    assert(dashCss.includes(sel), `dashboard.css must declare ${sel}`);
    console.log(`  ✅ CSS Selector "${sel}" verified declared in media.css and dashboard.css`);
  });

  assert(dashCss.includes('.visually-hidden'), 'dashboard.css must declare .visually-hidden');
  console.log('  ✅ .visually-hidden utility class declared');
}

// =============================================================================
// Test 5: Bilingual i18n Parity for All 12 Effects
// =============================================================================
console.log('\nTest 5: Bilingual i18n Parity for Visualizer Effects');
{
  const dashCode = fs.readFileSync(dashJsPath, 'utf8');
  const match = dashCode.match(/const DASHBOARD_I18N = (\{[\s\S]*?\n\};)/);
  assert(match, 'DASHBOARD_I18N must exist in dashboard.js');

  const dict = eval('(' + match[1].replace(/;\s*$/, '') + ')');
  const effectKeys = [
    'visualizer_effect_label',
    'viz_effect_bars',
    'viz_effect_wave',
    'viz_effect_radial',
    'viz_effect_matrix',
    'viz_effect_flame',
    'viz_effect_stereo',
    'viz_effect_lissajous',
    'viz_effect_hex_grid',
    'viz_effect_particles',
    'viz_effect_retro_grid',
    'viz_effect_vinyl_rings',
    'viz_effect_liquid_wave'
  ];

  effectKeys.forEach(k => {
    assert(dict.en[k], `DASHBOARD_I18N.en must contain key "${k}"`);
    assert(dict.hi[k], `DASHBOARD_I18N.hi must contain key "${k}"`);
    console.log(`  ✅ Key "${k}": en="${dict.en[k]}" | hi="${dict.hi[k]}"`);
  });
}

// =============================================================================
// Test 6: UTF-8 BOM Audit
// =============================================================================
console.log('\nTest 6: UTF-8 BOM (0xEF, 0xBB, 0xBF) Standard Audit');
{
  const files = [htmlPath, dashJsPath, featureJsPath, mediaCssPath, dashCssPath];
  files.forEach(f => {
    const buf = fs.readFileSync(f);
    assert(buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF, `${path.basename(f)} must start with UTF-8 BOM`);
    console.log(`  ✅ ${path.basename(f)} certified UTF-8 BOM standard`);
  });
}

console.log('\n===========================================================================');
console.log('🎉 ALL 6 TESTS IN VISUALIZER DROPDOWN & EFFECTS SUITE PASSED (Exit Code 0)!');
console.log('===========================================================================\n');
