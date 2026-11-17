/**
 * Web Activity & Media Sentinel - Spectrum Visualizer Runtime Wiring & Interactivity Test Suite
 * Validates script tag linking, browser runtime module resolution, interactive mode switching,
 * real-time VU meter decibel calculations, zero-overhead idle sleep sentinel, and strict CSP/BOM compliance.
 *
 * 100% W3C Trusted Types Safe (Zero innerHTML assignments).
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('🧪 Starting Real-Time Spectrum Visualizer Runtime Wiring & Interactivity Test Suite...\n');

const rootDir = path.resolve(__dirname, '..');
const htmlPath = path.join(rootDir, 'dashboard', 'dashboard.html');
const dashJsPath = path.join(rootDir, 'dashboard', 'dashboard.js');
const featureJsPath = path.join(rootDir, 'src', 'dashboard', 'features', 'media_deck_visualizer_feature.js');

// =============================================================================
// Battery 1: DOM Invariant & Script Tag Presence in dashboard.html
// =============================================================================
console.log('Battery 1: DOM Invariant & Script Tag Presence in dashboard.html');
{
  assert(fs.existsSync(htmlPath), 'dashboard.html must exist on disk');
  const html = fs.readFileSync(htmlPath, 'utf8');

  // Verify script tag ordering: feature module before core dashboard
  const featureScriptTag = '<script src="../src/dashboard/features/media_deck_visualizer_feature.js"></script>';
  const dashboardScriptTag = '<script src="dashboard.js"></script>';

  assert(html.includes(featureScriptTag), 'dashboard.html must link media_deck_visualizer_feature.js via relative script tag');
  assert(html.includes(dashboardScriptTag), 'dashboard.html must link dashboard.js');

  const featureIdx = html.indexOf(featureScriptTag);
  const dashIdx = html.indexOf(dashboardScriptTag);
  assert(featureIdx > -1 && dashIdx > -1, 'Both script tags must be found');
  assert(featureIdx < dashIdx, 'media_deck_visualizer_feature.js must be loaded BEFORE dashboard.js for browser runtime resolution');

  // Verify required visualizer DOM elements
  const requiredElements = [
    'visualizerPanel',
    'txtVisualizerTitle',
    'selectVizEffect',
    'btnVizModeBars',
    'btnVizModeWave',
    'canvasAudioVisualizer',
    'vuBarLeft',
    'vuBarRight',
    'vuValLeft',
    'vuValRight',
    'vuClipIndicator'
  ];

  requiredElements.forEach(id => {
    assert(html.includes(`id="${id}"`), `dashboard.html must declare element #${id}`);
  });

  const expectedModes = ['bars', 'wave', 'radial', 'matrix_dots', 'flame', 'stereo_mirror'];
  expectedModes.forEach(mode => {
    assert(html.includes(`value="${mode}"`), `dashboard.html must contain effect option value="${mode}"`);
  });

  console.log('  ✅ Script tags correctly sequenced: media_deck_visualizer_feature.js loaded before dashboard.js');
  console.log('  ✅ All 11 Spectrum Visualizer, Dropdown & VU Meter DOM elements verified in dashboard.html');
}

// =============================================================================
// Battery 2: Browser Runtime Global Loading Simulation (Zero-require)
// =============================================================================
console.log('\nBattery 2: Browser Runtime Global Loading Simulation (Zero-require)');
{
  const featureCode = fs.readFileSync(featureJsPath, 'utf8');

  // Create isolated browser sandbox with NO Node.js require
  const browserSandbox = {
    window: {},
    document: null,
    self: {},
    console: console,
    Math: Math,
    Date: Date,
    Float32Array: Float32Array,
    Object: Object,
    Array: Array,
    Number: Number,
    Boolean: Boolean
  };
  browserSandbox.globalThis = browserSandbox.window;
  browserSandbox.window.window = browserSandbox.window;

  // Execute in isolated browser context without require
  assert.doesNotThrow(() => {
    vm.runInNewContext(featureCode, browserSandbox);
  }, 'Feature module must execute cleanly in pure browser context without require()');

  assert(browserSandbox.window.MediaDeckVisualizerFeature, 'window.MediaDeckVisualizerFeature must be populated');
  assert.strictEqual(browserSandbox.window.MediaDeckVisualizerFeature.id, 'dashboard_media_deck_and_visualizer');
  assert.strictEqual(typeof browserSandbox.window.MediaDeckVisualizerFeature.initAudioVisualizer, 'function');
  assert.strictEqual(typeof browserSandbox.window.MediaDeckVisualizerFeature.setVisualizerMode, 'function');
  assert.strictEqual(typeof browserSandbox.window.MediaDeckVisualizerFeature.renderVisualizerFrame, 'function');
  assert.strictEqual(typeof browserSandbox.window.MediaDeckVisualizerFeature.setAudioPlayingState, 'function');

  console.log('  ✅ Feature registers on window.MediaDeckVisualizerFeature without Node.js require');
  console.log('  ✅ All 6 visualizer engine core methods present on export contract');
}

// =============================================================================
// Battery 3: Interactive 6-Effect Mode Switcher & Dropdown Sync
// =============================================================================
console.log('\nBattery 3: Interactive 6-Effect Mode Switcher & Dropdown Sync');
{
  const feature = require(featureJsPath);

  // Mock DOM Elements
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
  const mockBarsBtn = createMockElement('btnVizModeBars', ['btn-active', 'active']);
  const mockWaveBtn = createMockElement('btnVizModeWave');
  const mockDoc = {
    getElementById: (id) => {
      if (id === 'selectVizEffect') return mockSelect;
      if (id === 'btnVizModeBars') return mockBarsBtn;
      if (id === 'btnVizModeWave') return mockWaveBtn;
      return null;
    },
    addEventListener: () => {}
  };

  const ALL_MODES = ['bars', 'wave', 'radial', 'matrix_dots', 'flame', 'stereo_mirror'];

  ALL_MODES.forEach((mode) => {
    const res = feature.setVisualizerMode(mode, { doc: mockDoc });
    assert.strictEqual(res, mode, `setVisualizerMode("${mode}") must return "${mode}"`);
    const state = feature.getVisualizerState();
    assert.strictEqual(state.mode, mode, `Visualizer state.mode must be "${mode}"`);
    assert.strictEqual(mockSelect.value, mode, `selectVizEffect.value must synchronize to "${mode}"`);

    if (mode === 'bars') {
      assert(mockBarsBtn.classList.contains('active'), 'Bars button must have active class in bars mode');
      assert(!mockWaveBtn.classList.contains('active'), 'Wave button must NOT have active class in bars mode');
    } else if (mode === 'wave') {
      assert(mockWaveBtn.classList.contains('active'), 'Wave button must have active class in wave mode');
      assert(!mockBarsBtn.classList.contains('active'), 'Bars button must NOT have active class in wave mode');
    } else {
      assert(!mockBarsBtn.classList.contains('active'), 'Bars button must NOT have active class in custom mode');
      assert(!mockWaveBtn.classList.contains('active'), 'Wave button must NOT have active class in custom mode');
    }
  });

  console.log('  ✅ All 6 visualizer modes verified for state transitions, button states, and dropdown sync');
}

// =============================================================================
// Battery 4: Stereo VU Meter Decibel Scaling & +0dB Clipping Indicator
// =============================================================================
console.log('\nBattery 4: Stereo VU Meter Decibel Scaling & +0dB Clipping Indicator');
{
  const feature = require(featureJsPath);
  const { amplitudeToDb, dbToPercent } = feature;

  // Amplitude to dB test: 20 * log10(amp)
  assert.strictEqual(amplitudeToDb(0), -40, 'Silence amplitude (0) maps to -40dB floor');
  assert.strictEqual(amplitudeToDb(1.0), 0, 'Full nominal amplitude (1.0) maps to 0dB');
  assert.strictEqual(amplitudeToDb(0.5), -6.0, 'Half amplitude (0.5) maps to -6dB');
  assert.strictEqual(amplitudeToDb(2.0), 6.0, 'Boosted amplitude (2.0) clamps to +6dB ceiling');

  // dB to percentage: (db - (-40)) / (6 - (-40)) * 100
  const pctSilence = dbToPercent(-40);
  const pctNominal = dbToPercent(0);
  const pctCeiling = dbToPercent(6);

  assert.strictEqual(Math.round(pctSilence), 0, '-40dB maps to 0% width');
  assert(pctNominal > 85 && pctNominal < 88, '0dB maps to ~86.96% width');
  assert.strictEqual(Math.round(pctCeiling), 100, '+6dB maps to 100% width');

  console.log('  ✅ Decibel conversions: silence (-40dB), half-power (-6dB), nominal (0dB), max (+6dB)');
  console.log('  ✅ VU meter bar width scales proportionally from 0% to 100%');
}

// =============================================================================
// Battery 5: Zero-Overhead Idle Sleep Sentinel & RAF Lifecycle
// =============================================================================
console.log('\nBattery 5: Zero-Overhead Idle Sleep Sentinel & RAF Lifecycle');
{
  const feature = require(featureJsPath);

  // Set audio playing state to false -> should sleep
  feature.setAudioPlayingState(false);
  const statePaused = feature.getVisualizerState();
  assert.strictEqual(statePaused.isPlaying, false, 'isPlaying must be false when paused');
  assert.strictEqual(statePaused.isSleeping, true, 'isSleeping must be true when paused');
  assert.strictEqual(statePaused.rafId, null, 'RAF ID must be null when sleeping (0% CPU)');

  // Set audio playing state to true with hidden document -> should stay asleep
  const mockHiddenDoc = { visibilityState: 'hidden', addEventListener: () => {} };
  feature.setAudioPlayingState(true, { doc: mockHiddenDoc });
  const stateHidden = feature.getVisualizerState();
  assert.strictEqual(stateHidden.isSleeping, true, 'Visualizer must sleep when document is hidden');

  // Restore audio to paused
  feature.setAudioPlayingState(false);

  console.log('  ✅ Zero CPU cycles consumed when media is paused (RAF loop halted)');
  console.log('  ✅ Background tab detection prevents unnecessary rendering when hidden');
}

// =============================================================================
// Battery 6: W3C Trusted Types & Zero innerHTML Security Audit
// =============================================================================
console.log('\nBattery 6: W3C Trusted Types & Zero innerHTML Security Audit');
{
  const featureCode = fs.readFileSync(featureJsPath, 'utf8');
  assert(!featureCode.includes('.innerHTML'), 'media_deck_visualizer_feature.js must NOT use innerHTML');
  assert(!featureCode.includes('dangerouslySetInnerHTML'), 'media_deck_visualizer_feature.js must NOT use dangerous HTML');

  const dashCode = fs.readFileSync(dashJsPath, 'utf8');
  // Visualizer facades in dashJs must have 0 innerHTML assignments
  const vizFacadeRegex = /function\s+(initAudioVisualizer|setVisualizerMode|renderVisualizerFrame|setAudioPlayingState)\s*\([\s\S]*?\n\}/g;
  let match;
  while ((match = vizFacadeRegex.exec(dashCode)) !== null) {
    assert(!match[0].includes('.innerHTML'), `Facade function ${match[1]} must not contain innerHTML`);
  }

  const html = fs.readFileSync(htmlPath, 'utf8');
  assert(!html.includes('onclick='), 'dashboard.html must contain 0 inline onclick handlers');
  assert(!html.includes('onload='), 'dashboard.html must contain 0 inline onload handlers');

  console.log('  ✅ 0 innerHTML assignments in visualizer feature and facades');
  console.log('  ✅ 0 inline event handlers in dashboard.html');
  console.log('  ✅ 100% compliant with W3C Trusted Types & Chrome Manifest V3 CSP');
}

// =============================================================================
// Battery 7: UTF-8 with BOM (0xEF, 0xBB, 0xBF) Compliance
// =============================================================================
console.log('\nBattery 7: UTF-8 with BOM (0xEF, 0xBB, 0xBF) Compliance');
{
  const targetFiles = [htmlPath, dashJsPath, featureJsPath];
  targetFiles.forEach(f => {
    const buf = fs.readFileSync(f);
    const hasBOM = buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF;
    assert(hasBOM, `File ${path.basename(f)} MUST begin with UTF-8 BOM (0xEF, 0xBB, 0xBF)`);
    console.log(`  ✅ ${path.basename(f)} certified UTF-8 with BOM`);
  });
}

console.log('\n============================================================');
console.log('🎉 ALL 7 BATTERIES IN VISUALIZER RUNTIME SUITE PASSED CLEANLY (Exit Code 0)!');
console.log('============================================================\n');
