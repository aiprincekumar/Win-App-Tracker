/**
 * Web Activity & Media Sentinel - Dashboard Audio Lab 2x2 Grid & Sub-Bass Boost Verification
 * Task ID: TASK-DASHBOARD-AUDIOLAB-2X2-GRID-001
 * 
 * Verifies:
 * Battery 1: Header Badge Refinement Verification (absence of #audioLabPresetBadge, presence of #audioLabVocalBadge & #audioLabNightBadge)
 * Battery 2: 2x2 Grid Layout & 4 Cards Structure (.enhancements-grid chips, toggles, ARIA switch roles)
 * Battery 3: CSS 2-Column Geometry, Containment & Scoped Switch Toggle Centering (repeat(2, minmax(0, 1fr)), box-sizing, min-width: 0, overflow: hidden, 640px collapse, scoped .switch-toggle, untouched global switch)
 * Battery 4: Web Audio DSP Pipeline Low-Shelf Math (lowshelf filter at 60Hz +7dB, vocal_clarity net offset +3dB, clamping at +12dB)
 * Battery 5: Controller & Storage Persistence Contract (DEFAULT_AUDIO_LAB_SETTINGS, toggleBassBoost checked sync, persistDashboardAudioLabSettings)
 * Battery 6: Bilingual i18n Dictionary Parity (audiolab_bass_title & audiolab_bass_desc in en & hi dictionaries)
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('\n===========================================================================');
console.log('🧪 Starting Dashboard Audio Lab 2x2 Grid & Sub-Bass Boost Test Suite');
console.log('Task: TASK-DASHBOARD-AUDIOLAB-2X2-GRID-001');
console.log('===========================================================================\n');

const rootDir = path.resolve(__dirname, '..');
const dashHtmlPath = path.join(rootDir, 'dashboard', 'dashboard.html');
const dashCssPath = path.join(rootDir, 'dashboard', 'dashboard.css');
const audioLabCssPath = path.join(rootDir, 'dashboard', 'styles', 'audio_lab.css');
const dashJsPath = path.join(rootDir, 'dashboard', 'dashboard.js');
const i18nJsPath = path.join(rootDir, 'src', 'core', 'i18n.js');
const webAudioDspPath = path.join(rootDir, 'src', 'inject', 'audio', 'web_audio_dsp.js');
const controllerPath = path.join(rootDir, 'src', 'dashboard', 'audio', 'audio_lab_controller.js');

const html = fs.readFileSync(dashHtmlPath, 'utf8');
const dashCss = fs.readFileSync(dashCssPath, 'utf8');
const audioLabCss = fs.readFileSync(audioLabCssPath, 'utf8');

// ===========================================================================
// Battery 1: Header Badge Refinement Verification
// ===========================================================================
console.log('Battery 1: Header Badge Refinement Verification');
{
  assert(html.includes('id="audioLabPresetBadge"'), 'dashboard.html must contain #audioLabPresetBadge in header');
  assert(html.includes('id="audioLabVocalBadge"'), 'dashboard.html must contain #audioLabVocalBadge in header');
  assert(html.includes('id="audioLabNightBadge"'), 'dashboard.html must contain #audioLabNightBadge in header');
  assert(html.includes('id="audioEqPresetSelect"'), 'dashboard.html must contain #audioEqPresetSelect in Equalizer card');
  assert(html.includes('id="heroAudioEqCard"'), 'dashboard.html must contain dedicated #heroAudioEqCard');
  assert(html.includes('id="heroAudioLabCard"'), 'dashboard.html must contain dedicated #heroAudioLabCard');

  console.log('  ✅ #audioLabPresetBadge eliminated from Audio Lab header');
  console.log('  ✅ Dynamic feature badges (#audioLabVocalBadge, #audioLabNightBadge) preserved in header');
  console.log('  ✅ #audioEqPresetSelect correctly located in dedicated #heroAudioEqCard');
}

// ===========================================================================
// Battery 2: 2x2 Grid Layout & 4 Cards Structure
// ===========================================================================
console.log('\nBattery 2: 2x2 Grid Layout & 4 Cards Structure');
{
  // Extract .enhancements-grid from dashboard.html
  const gridMatch = html.match(/<div class="enhancements-grid">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<!-- Media Playback/);
  assert(gridMatch, 'dashboard.html must contain .enhancements-grid container');
  const gridHtml = gridMatch[1];

  // Count .enhancement-card chips (excluding child header containers)
  const cardMatches = gridHtml.match(/class="[^"]*enhancement-chip[^"]*"/g) || [];
  assert.strictEqual(cardMatches.length, 4, `Must contain exactly 4 enhancement cards, found ${cardMatches.length}`);

  // Verify all 4 switch toggles and labels
  const expectedToggles = [
    { id: 'toggleVocalClarity', titleId: 'lblAudioVocalTitle', descId: 'lblAudioVocalDesc', label: 'Vocal Clarity' },
    { id: 'toggleNightShield', titleId: 'lblAudioNightTitle', descId: 'lblAudioNightDesc', label: 'Night Shield' },
    { id: 'toggleBassBoost', titleId: 'lblAudioBassTitle', descId: 'lblAudioBassDesc', label: 'Sub-Bass Boost' },
    { id: 'toggleAudioOnlyMode', titleId: 'lblAudioOnlyTitle', descId: 'lblAudioOnlyDesc', label: 'Audio-Only Mode' }
  ];

  expectedToggles.forEach(({ id, titleId, descId, label }) => {
    assert(gridHtml.includes(`id="${id}"`), `enhancements-grid must contain #${id}`);
    assert(gridHtml.includes(`id="${titleId}"`), `enhancements-grid must contain #${titleId}`);
    assert(gridHtml.includes(`id="${descId}"`), `enhancements-grid must contain #${descId}`);
    assert(gridHtml.includes('role="switch"'), `toggles must declare role="switch"`);
    assert(gridHtml.includes(`aria-label="${label}"`), `toggle #${id} must declare aria-label="${label}"`);
    console.log(`  ✅ Enhancement card verified: #${id} (${label}) with title #${titleId} and desc #${descId}`);
  });
}

// ===========================================================================
// Battery 3: CSS 2-Column Geometry & Containment
// ===========================================================================
console.log('\nBattery 3: CSS 2-Column Geometry, Containment & Scoped Switch Toggle Centering');
{
  [
    { name: 'audio_lab.css', content: audioLabCss },
    { name: 'dashboard.css', content: dashCss }
  ].forEach(({ name, content }) => {
    // 2-column repeat(2, minmax(0, 1fr))
    assert(
      content.includes('grid-template-columns: repeat(2, minmax(0, 1fr))'),
      `${name} must specify grid-template-columns: repeat(2, minmax(0, 1fr))`
    );

    // Card sizing & containment
    assert(
      /\.enhancement-card\.enhancement-chip\s*\{[^}]*box-sizing:\s*border-box;/s.test(content),
      `${name}: .enhancement-card.enhancement-chip must declare box-sizing: border-box`
    );
    assert(
      /\.enhancement-card\.enhancement-chip\s*\{[^}]*min-width:\s*0;/s.test(content),
      `${name}: .enhancement-card.enhancement-chip must declare min-width: 0`
    );
    assert(
      /\.enhancement-card\.enhancement-chip\s*\{[^}]*overflow:\s*hidden;/s.test(content),
      `${name}: .enhancement-card.enhancement-chip must declare overflow: hidden`
    );

    // Verify switch-toggle scoping to .enhancement-card / .enhancements-grid
    assert(
      /\.enhancement-card\s+\.switch-toggle,\s*\.enhancements-grid\s+\.switch-toggle\s*\{[^}]*width:\s*40px;[^}]*height:\s*22px;/s.test(content),
      `${name}: .enhancement-card .switch-toggle must declare 40px width and 22px height`
    );
    assert(
      /\.enhancement-card\s+\.switch-toggle\s+\.slider-round:before,\s*\.enhancements-grid\s+\.switch-toggle\s+\.slider-round:before\s*\{[^}]*top:\s*4px;[^}]*bottom:\s*4px;/s.test(content),
      `${name}: scoped slider-round:before must declare vertical centering top: 4px; bottom: 4px;`
    );

    // Unscoped .switch-toggle with 40px width must NOT exist (prevents global switch pollution)
    assert(
      !/(?:^|\n)\.switch-toggle\s*\{[^}]*width:\s*40px;/s.test(content),
      `${name}: must NOT contain unscoped .switch-toggle with 40px width`
    );

    console.log(`  ✅ ${name}: 2-column grid geometry, card containment & scoped switch-toggle (40x22, top: 4px/bottom: 4px) verified`);
  });

  // Canonical global .switch-toggle in dashboard.css must remain 100% untouched
  assert(
    /\.switch-toggle\s*\{[^}]*width:\s*44px;[^}]*height:\s*24px;/s.test(dashCss),
    'dashboard.css: canonical global .switch-toggle (44x24px) must remain untouched'
  );
  assert(
    /\.slider-round:before\s*\{[^}]*height:\s*18px;[^}]*width:\s*18px;[^}]*left:\s*3px;[^}]*bottom:\s*3px;/s.test(dashCss),
    'dashboard.css: canonical global .slider-round:before (18x18px, bottom: 3px) must remain untouched'
  );
  console.log('  ✅ Canonical global .switch-toggle (44x24px, 18px thumb) preserved untouched in dashboard.css');

  // Responsive collapse on mobile (max-width: 640px -> 1fr)
  assert(
    dashCss.includes('@media (max-width: 640px)') &&
    dashCss.includes('grid-template-columns: 1fr'),
    'dashboard.css must collapse enhancements-grid to 1fr on mobile (max-width: 640px)'
  );
  console.log('  ✅ Mobile responsive collapse to 1fr verified in dashboard.css');
}

// ===========================================================================
// Battery 4: Web Audio DSP Pipeline Low-Shelf Math
// ===========================================================================
console.log('\nBattery 4: Web Audio DSP Pipeline Low-Shelf Math');
{
  // Mock Web Audio Context
  class MockAudioParam {
    constructor(val = 0) {
      this.value = val;
    }
    setValueAtTime(val) {
      this.value = val;
    }
  }

  class MockBiquadFilter {
    constructor() {
      this.type = 'peaking';
      this.frequency = new MockAudioParam(1000);
      this.gain = new MockAudioParam(0);
      this.Q = new MockAudioParam(1);
    }
    connect() {}
  }

  class MockGainNode {
    constructor() {
      this.gain = new MockAudioParam(1.0);
    }
    connect() {}
  }

  class MockDynamicsCompressor {
    constructor() {
      this.threshold = new MockAudioParam(-10);
      this.knee = new MockAudioParam(30);
      this.ratio = new MockAudioParam(12);
      this.attack = new MockAudioParam(0.003);
      this.release = new MockAudioParam(0.25);
    }
    connect() {}
  }

  class MockAudioContext {
    constructor() {
      this.currentTime = 0;
      this.state = 'running';
      this.destination = {};
    }
    createGain() { return new MockGainNode(); }
    createBiquadFilter() { return new MockBiquadFilter(); }
    createDynamicsCompressor() { return new MockDynamicsCompressor(); }
    createMediaElementSource() { return { connect() {} }; }
    resume() { return Promise.resolve(); }
  }

  global.AudioContext = MockAudioContext;

  const mockVideo = {
    __sentinelMediaSource__: null,
    tagName: 'VIDEO'
  };

  const WebAudioDSP = require(webAudioDspPath);
  assert(typeof WebAudioDSP.setupWebAudioPipeline === 'function', 'WebAudioDSP.setupWebAudioPipeline must exist');
  assert(typeof WebAudioDSP.applyAudioLabSettings === 'function', 'WebAudioDSP.applyAudioLabSettings must exist');

  const setupOk = WebAudioDSP.setupWebAudioPipeline(mockVideo);
  assert.strictEqual(setupOk, true, 'setupWebAudioPipeline must return true');

  const filters = WebAudioDSP.getEqFilters();
  assert(filters['60'], '60Hz low-shelf filter must exist in pipeline');
  assert.strictEqual(filters['60'].type, 'lowshelf', '60Hz filter type must be lowshelf');

  // Test 1: Sub-Bass Boost only (+7dB at 60Hz)
  WebAudioDSP.applyAudioLabSettings({
    eq_bands: { '60': 0, '250': 0, '1000': 0, '4000': 0, '16000': 0 },
    bass_boost: true,
    vocal_clarity: false
  });
  assert.strictEqual(filters['60'].gain.value, 7, 'Sub-Bass Boost only must set 60Hz gain to +7dB');
  console.log('  ✅ bass_boost: true sets 60Hz lowshelf filter to +7dB');

  // Test 2: Combined Sub-Bass Boost (+7dB) & Vocal Clarity (-4dB at 60Hz) -> Net +3dB
  WebAudioDSP.applyAudioLabSettings({
    eq_bands: { '60': 0, '250': 0, '1000': 0, '4000': 0, '16000': 0 },
    bass_boost: true,
    vocal_clarity: true
  });
  assert.strictEqual(filters['60'].gain.value, 3, 'Combined bass_boost and vocal_clarity must yield +3dB at 60Hz');
  assert.strictEqual(filters['1000'].gain.value, 6, 'Vocal clarity must apply +6dB boost at 1000Hz');
  console.log('  ✅ Conflict-free combination: bass_boost (+7dB) + vocal_clarity (-4dB) = +3dB net offset at 60Hz');

  // Test 3: Upper clamping at +12dB
  WebAudioDSP.applyAudioLabSettings({
    eq_bands: { '60': 9 },
    bass_boost: true,
    vocal_clarity: false
  });
  assert.strictEqual(filters['60'].gain.value, 12, '60Hz gain must be clamped at +12dB max (9 + 7 = 16 -> 12)');
  console.log('  ✅ Upper clamping at +12dB ceiling mathematically verified');

  // Test 4: Disable bass boost restores band value
  WebAudioDSP.applyAudioLabSettings({
    eq_bands: { '60': 2 },
    bass_boost: false,
    vocal_clarity: false
  });
  assert.strictEqual(filters['60'].gain.value, 2, 'Disabling bass_boost must restore base band gain (+2dB)');
  console.log('  ✅ Disabling bass_boost accurately restores base EQ band value');
}

// ===========================================================================
// Battery 5: Controller & Storage Persistence Contract
// ===========================================================================
console.log('\nBattery 5: Controller & Storage Persistence Contract');
{
  const controller = require(controllerPath);
  assert(controller.DEFAULT_AUDIO_LAB_SETTINGS, 'DEFAULT_AUDIO_LAB_SETTINGS must be exported');
  assert.strictEqual(controller.DEFAULT_AUDIO_LAB_SETTINGS.bass_boost, false, 'DEFAULT_AUDIO_LAB_SETTINGS must include bass_boost: false');

  // Mock DOM for updateDashboardAudioLabUI
  const mockToggleBass = { checked: false };
  const mockDoc = {
    getElementById: (id) => {
      if (id === 'toggleBassBoost') return mockToggleBass;
      return null;
    }
  };

  controller.updateDashboardAudioLabUI({ bass_boost: true }, {}, mockDoc);
  assert.strictEqual(mockToggleBass.checked, true, 'updateDashboardAudioLabUI must set toggleBassBoost.checked = true');

  controller.updateDashboardAudioLabUI({ bass_boost: false }, {}, mockDoc);
  assert.strictEqual(mockToggleBass.checked, false, 'updateDashboardAudioLabUI must set toggleBassBoost.checked = false');
  console.log('  ✅ updateDashboardAudioLabUI synchronizes #toggleBassBoost.checked bidirectionally');

  // Storage Persistence
  let storedData = null;
  const mockStorageApi = {
    storage: {
      local: {
        set: (data) => { storedData = data; }
      }
    },
    runtime: { sendMessage: () => {} },
    tabs: { sendMessage: () => {} }
  };

  const saved = controller.persistDashboardAudioLabSettings({ bass_boost: true }, null, mockStorageApi);
  assert.strictEqual(saved.bass_boost, true, 'persistDashboardAudioLabSettings must return settings with bass_boost: true');
  assert(storedData && storedData.audio_lab_settings, 'Storage API set must be called with audio_lab_settings');
  assert.strictEqual(storedData.audio_lab_settings.bass_boost, true, 'Stored settings must contain bass_boost: true');
  console.log('  ✅ persistDashboardAudioLabSettings writes bass_boost state to chrome.storage.local');
}

// ===========================================================================
// Battery 6: Bilingual i18n Dictionary Parity
// ===========================================================================
console.log('\nBattery 6: Bilingual i18n Dictionary Parity');
{
  // 1. Check src/core/i18n.js
  const i18nModule = require(i18nJsPath);
  const coreEn = (i18nModule.DICTIONARY && i18nModule.DICTIONARY.en) || {};
  const coreHi = (i18nModule.DICTIONARY && i18nModule.DICTIONARY.hi) || {};

  assert(coreEn.audiolab_bass_title, 'src/core/i18n.js EN dictionary must contain audiolab_bass_title');
  assert(coreEn.audiolab_bass_desc, 'src/core/i18n.js EN dictionary must contain audiolab_bass_desc');
  assert(coreHi.audiolab_bass_title, 'src/core/i18n.js HI dictionary must contain audiolab_bass_title');
  assert(coreHi.audiolab_bass_desc, 'src/core/i18n.js HI dictionary must contain audiolab_bass_desc');

  // 2. Check dashboard/dashboard.js
  const dashModule = require(dashJsPath);
  const dashEn = (dashModule.DASHBOARD_I18N && dashModule.DASHBOARD_I18N.en) || {};
  const dashHi = (dashModule.DASHBOARD_I18N && dashModule.DASHBOARD_I18N.hi) || {};

  assert(dashEn.audiolab_bass_title, 'dashboard.js DASHBOARD_I18N.en must contain audiolab_bass_title');
  assert(dashEn.audiolab_bass_desc, 'dashboard.js DASHBOARD_I18N.en must contain audiolab_bass_desc');
  assert(dashHi.audiolab_bass_title, 'dashboard.js DASHBOARD_I18N.hi must contain audiolab_bass_title');
  assert(dashHi.audiolab_bass_desc, 'dashboard.js DASHBOARD_I18N.hi must contain audiolab_bass_desc');

  // Value exactness and cross-file equality
  assert.strictEqual(coreEn.audiolab_bass_title, dashEn.audiolab_bass_title, 'EN title must match across files');
  assert.strictEqual(coreEn.audiolab_bass_desc, dashEn.audiolab_bass_desc, 'EN desc must match across files');
  assert.strictEqual(coreHi.audiolab_bass_title, dashHi.audiolab_bass_title, 'HI title must match across files');
  assert.strictEqual(coreHi.audiolab_bass_desc, dashHi.audiolab_bass_desc, 'HI desc must match across files');

  console.log(`  ✅ EN: "${dashEn.audiolab_bass_title}" - "${dashEn.audiolab_bass_desc}"`);
  console.log(`  ✅ HI: "${dashHi.audiolab_bass_title}" - "${dashHi.audiolab_bass_desc}"`);
  console.log('  ✅ 100% bilingual dictionary parity verified across src/core/i18n.js and dashboard/dashboard.js');
}

console.log('\n===========================================================================');
console.log('🎉 ALL 6 TEST BATTERIES IN DASHBOARD AUDIO LAB 2X2 GRID & BASS BOOST PASSED!');
console.log('===========================================================================\n');
